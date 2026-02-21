import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';

export interface Permission {
  resource: string;
  actions: string[]; // ['create', 'read', 'update', 'delete']
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid', { name: 'role_id' })
  id: string;

  @Column({ name: 'role_name', unique: true, length: 50 })
  name: string;

  @Column('text')
  description: string;

  @Column('json')
  permissions: Permission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  constructor(partial: Partial<Role>) {
    Object.assign(this, partial);
  }
}
