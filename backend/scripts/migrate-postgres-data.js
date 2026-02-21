/* eslint-disable no-console */
const { Client } = require('pg');
const JSON_OIDS = new Set([114, 3802]); // json, jsonb

const quoteIdent = (value) => `"${String(value).replace(/"/g, '""')}"`;

function buildConfig(prefix, defaults) {
  return {
    host: process.env[`${prefix}_DB_HOST`] || defaults.host,
    port: Number(process.env[`${prefix}_DB_PORT`] || defaults.port),
    user: process.env[`${prefix}_DB_USERNAME`] || defaults.user,
    password: process.env[`${prefix}_DB_PASSWORD`] || defaults.password,
    database: process.env[`${prefix}_DB_DATABASE`] || defaults.database,
  };
}

async function fetchTables(client) {
  const result = await client.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  return result.rows.map((row) => row.tablename);
}

async function fetchForeignKeyDependencies(client, tableNames) {
  const result = await client.query(
    `
      SELECT
        src.relname AS source_table,
        ref.relname AS referenced_table
      FROM pg_constraint con
      JOIN pg_class src ON src.oid = con.conrelid
      JOIN pg_namespace src_ns ON src_ns.oid = src.relnamespace
      JOIN pg_class ref ON ref.oid = con.confrelid
      JOIN pg_namespace ref_ns ON ref_ns.oid = ref.relnamespace
      WHERE con.contype = 'f'
        AND src_ns.nspname = 'public'
        AND ref_ns.nspname = 'public'
    `,
  );

  const tableSet = new Set(tableNames);
  return result.rows.filter(
    (row) => tableSet.has(row.source_table) && tableSet.has(row.referenced_table),
  );
}

function sortTablesByDependency(tableNames, dependencies) {
  const indegree = new Map(tableNames.map((table) => [table, 0]));
  const graph = new Map(tableNames.map((table) => [table, new Set()]));

  for (const dep of dependencies) {
    if (!graph.get(dep.referenced_table).has(dep.source_table)) {
      graph.get(dep.referenced_table).add(dep.source_table);
      indegree.set(dep.source_table, indegree.get(dep.source_table) + 1);
    }
  }

  const queue = [...tableNames.filter((table) => indegree.get(table) === 0)].sort();
  const ordered = [];

  while (queue.length) {
    const table = queue.shift();
    ordered.push(table);
    for (const next of graph.get(table)) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) {
        queue.push(next);
        queue.sort();
      }
    }
  }

  if (ordered.length < tableNames.length) {
    const remaining = tableNames.filter((table) => !ordered.includes(table)).sort();
    return [...ordered, ...remaining];
  }

  return ordered;
}

async function copyTableData(source, target, tableName) {
  const table = quoteIdent(tableName);
  const sourceRows = await source.query(`SELECT * FROM ${table}`);
  if (sourceRows.rows.length === 0) {
    return 0;
  }

  const columns = sourceRows.fields.map((field) => quoteIdent(field.name));
  const columnList = columns.join(', ');
  const batchSize = 200;
  let copied = 0;

  for (let start = 0; start < sourceRows.rows.length; start += batchSize) {
    const batch = sourceRows.rows.slice(start, start + batchSize);
    const values = [];
    const placeholders = batch
      .map((row, rowIndex) => {
        const params = sourceRows.fields.map((field, colIndex) => {
          const rawValue = row[field.name];
          const preparedValue =
            rawValue !== null && JSON_OIDS.has(field.dataTypeID)
              ? JSON.stringify(rawValue)
              : rawValue;
          values.push(preparedValue);
          return `$${rowIndex * sourceRows.fields.length + colIndex + 1}`;
        });
        return `(${params.join(', ')})`;
      })
      .join(', ');

    await target.query(
      `INSERT INTO ${table} (${columnList}) VALUES ${placeholders}`,
      values,
    );
    copied += batch.length;
  }

  return copied;
}

async function syncSequences(target) {
  const sequenceQuery = await target.query(`
    SELECT
      quote_ident(seq_ns.nspname) || '.' || quote_ident(seq.relname) AS sequence_name,
      quote_ident(tbl_ns.nspname) || '.' || quote_ident(tbl.relname) AS table_name,
      quote_ident(att.attname) AS column_name
    FROM pg_class seq
    JOIN pg_namespace seq_ns ON seq.relnamespace = seq_ns.oid
    JOIN pg_depend dep ON dep.objid = seq.oid AND dep.deptype = 'a'
    JOIN pg_class tbl ON dep.refobjid = tbl.oid
    JOIN pg_namespace tbl_ns ON tbl.relnamespace = tbl_ns.oid
    JOIN pg_attribute att ON att.attrelid = tbl.oid AND att.attnum = dep.refobjsubid
    WHERE seq.relkind = 'S' AND seq_ns.nspname = 'public'
  `);

  for (const row of sequenceQuery.rows) {
    await target.query(`
      SELECT setval(
        '${row.sequence_name}',
        COALESCE((SELECT MAX(${row.column_name}) FROM ${row.table_name}), 0) + 1,
        false
      )
    `);
  }
}

async function main() {
  const commonDefaults = {
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'compliance_admin',
  };

  const sourceConfig = buildConfig('SRC', { ...commonDefaults, host: '127.0.0.1' });
  const targetConfig = buildConfig('TGT', { ...commonDefaults, host: '192.168.1.48' });

  const source = new Client(sourceConfig);
  const target = new Client(targetConfig);

  try {
    await source.connect();
    await target.connect();

    const [sourceTables, targetTables] = await Promise.all([
      fetchTables(source),
      fetchTables(target),
    ]);

    const targetSet = new Set(targetTables);
    const sharedTables = sourceTables.filter((table) => targetSet.has(table));
    const missingTables = sourceTables.filter((table) => !targetSet.has(table));

    if (sharedTables.length === 0) {
      const srcPreview = sourceTables.slice(0, 10).join(', ') || '(none)';
      const tgtPreview = targetTables.slice(0, 10).join(', ') || '(none)';
      throw new Error(
        [
          'No shared tables found between source and target database.',
          `Source table count: ${sourceTables.length}. Sample: ${srcPreview}`,
          `Target table count: ${targetTables.length}. Sample: ${tgtPreview}`,
          'Tip: create target schema first (run migrations against target DB), then rerun this script.',
        ].join(' '),
      );
    }

    const dependencies = await fetchForeignKeyDependencies(target, sharedTables);
    const insertOrder = sortTablesByDependency(sharedTables, dependencies);

    let canUseReplicationRole = false;
    try {
      await target.query("SET session_replication_role = 'replica'");
      canUseReplicationRole = true;
      await target.query("SET session_replication_role = 'origin'");
    } catch (roleError) {
      console.warn(
        `No permission to set session_replication_role, fallback to deferred constraints: ${roleError.message}`,
      );
    }

    await target.query('BEGIN');
    if (canUseReplicationRole) {
      await target.query("SET session_replication_role = 'replica'");
    } else {
      await target.query('SET CONSTRAINTS ALL DEFERRED');
    }

    const truncateList = sharedTables.map((table) => quoteIdent(table)).join(', ');
    await target.query(`TRUNCATE TABLE ${truncateList} RESTART IDENTITY CASCADE`);

    for (const table of insertOrder) {
      const count = await copyTableData(source, target, table);
      console.log(`Copied ${count} rows -> ${table}`);
    }

    await syncSequences(target);
    if (canUseReplicationRole) {
      await target.query("SET session_replication_role = 'origin'");
    }
    await target.query('COMMIT');

    if (missingTables.length > 0) {
      console.warn(
        `Skipped ${missingTables.length} table(s) not present in target: ${missingTables.join(', ')}`,
      );
    }

    console.log('Migration completed.');
  } catch (error) {
    try {
      await target.query('ROLLBACK');
      try {
        await target.query("SET session_replication_role = 'origin'");
      } catch {
        // Ignore when role reset is not permitted.
      }
    } catch {
      // Ignore rollback cleanup errors.
    }
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await Promise.allSettled([source.end(), target.end()]);
  }
}

main();
