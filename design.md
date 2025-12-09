
# 开源合规智能助手系统设计文档

## 1. 概述

### 1.1 文档目的
本文档基于产品需求文档（PRD），详细描述开源合规智能助手系统的技术架构、核心模块设计、数据模型、API规范、安全机制等关键技术方案，为后续开发实施提供技术指导。

### 1.2 产品定位
开源合规智能助手是一款基于AI和双知识库（公开法律知识库与律师事务所内部知识库）的Web端开源合规评审平台，旨在为律师事务所提供高效、准确的开源软件合规性评审服务。

### 1.3 设计原则
- **模块化设计**：各功能模块高内聚、低耦合，便于维护和扩展
- **安全性优先**：严格的数据访问控制和权限管理，确保敏感信息安全
- **性能优化**：异步处理、缓存机制、索引优化，提升系统响应速度
- **可扩展性**：支持知识库扩展、AI模型升级、新SBOM格式支持
- **用户体验**：响应式设计，适配多种屏幕尺寸，操作流畅

## 2. 系统架构设计

### 2.1 技术栈选型

#### 2.1.1 前端技术栈
- **框架**：React 18 + TypeScript
- **构建工具**：Vite
- **UI组件库**：Ant Design 5.x
- **状态管理**：Zustand + React Query
- **样式方案**：Tailwind CSS + CSS Modules
- **富文本编辑**：Slate.js 或 ProseMirror
- **文件处理**：pdf-lib、 mammoth.js (Word解析)

#### 2.1.2 后端技术栈
- **框架**：NestJS + TypeScript
- **数据库**：PostgreSQL 15+ (主数据库)
- **缓存**：Redis 7+ (会话缓存、热点数据)
- **文件存储**：MinIO 或 AWS S3 (SBOM文件、知识库文档、报告)
- **搜索引擎**：Elasticsearch 8+ (知识库全文检索)
- **消息队列**：RabbitMQ 或 Apache Kafka (异步任务)
- **AI/ML框架**：Python FastAPI + LangChain + 向量数据库

#### 2.1.3 部署与运维
- **容器化**：Docker + Docker Compose
- **CI/CD**：GitHub Actions 或 GitLab CI
- **监控**：Prometheus + Grafana
- **日志**：ELK Stack (Elasticsearch, Logstash, Kibana)

### 2.2 系统分层架构

```mermaid
graph TB
    subgraph "用户层"
        UI[Web浏览器]
    end
    
    subgraph "前端应用层"
        FE[React前端应用]
        RT[React Router]
        ZT[Zustand状态管理]
        RQ[React Query数据获取]
    end
    
    subgraph "接入层"
        CDN[CDN静态资源]
        LB[负载均衡器 Nginx]
        WAF[Web应用防火墙]
    end
    
    subgraph "后端服务层"
        API[API Gateway]
        AUTH[认证服务]
        USER[用户服务]
        KB[知识库服务]
        SBOM[SBOM处理服务]
        REVIEW[合规评审服务]
        REPORT[报告服务]
        SYS[系统设置服务]
    end
    
    subgraph "AI服务层"
        AI[AI推理服务 FastAPI]
        EMBED[文本嵌入模型]
        LLM[大语言模型]
        VDB[向量数据库 Pinecone/Weaviate]
    end
    
    subgraph "数据存储层"
        PG[(PostgreSQL)]
        RD[(Redis)]
        ES[(Elasticsearch)]
        FS[(MinIO/S3文件存储)]
        MQ[(RabbitMQ/Kafka)]
    end
    
    UI --> CDN
    CDN --> LB
    LB --> WAF
    WAF --> API
    API --> AUTH
    API --> USER
    API --> KB
    API --> SBOM
    API --> REVIEW
    API --> REPORT
    API --> SYS
    
    REVIEW --> AI
    KB --> AI
    AI --> EMBED
    AI --> LLM
    AI --> VDB
    
    USER --> PG
    KB --> PG
    KB --> ES
    SBOM --> PG
    SBOM --> FS
    REVIEW --> PG
    REPORT --> PG
    REPORT --> FS
    SYS --> PG
    
    KB --> RD
    SBOM --> RD
    REVIEW --> RD
    REPORT --> RD
    
    SBOM --> MQ
    REVIEW --> MQ
    REPORT --> MQ
```

### 2.3 微服务划分

根据业务领域，系统划分为以下微服务：

1. **用户服务 (User Service)**：用户注册、登录、权限管理
2. **知识库服务 (KnowledgeBase Service)**：知识库管理、文档CRUD、分类标签
3. **SBOM处理服务 (SBOM Service)**：SBOM上传、解析、组件识别
4. **合规评审服务 (Review Service)**：AI评审、风险识别、人工调整
5. **报告服务 (Report Service)**：报告模板管理、生成、导出
6. **系统设置服务 (System Service)**：系统配置、日志、备份
7. **AI推理服务 (AI Service)**：独立的Python服务，处理AI相关逻辑

## 3. 核心功能模块设计

### 3.1 知识库管理模块

#### 3.1.1 架构设计
```mermaid
graph TD
    KB_API[知识库API] --> KB_SERVICE[知识库服务]
    KB_SERVICE --> KB_CACHE[Redis缓存层]
    KB_SERVICE --> KB_DB[(PostgreSQL)]
    KB_SERVICE --> KB_SEARCH[Elasticsearch]
    KB_SERVICE --> KB_STORAGE[MinIO文件存储]
    
    KB_SERVICE --> DOC_PARSER[文档解析器]
    DOC_PARSER --> PDF[PDF解析]
    DOC_PARSER --> WORD[Word解析]
    DOC_PARSER --> TXT[文本解析]
    DOC_PARSER --> OCR[OCR识别]
    
    KB_SERVICE --> KB_INDEXER[索引构建器]
    KB_INDEXER --> EMBEDDING[文本嵌入]
    EMBEDDING --> VDB[(向量数据库)]
```

#### 3.1.2 关键设计点
- **多知识库隔离**：通过`KBID`字段隔离不同知识库，支持独立权限配置
- **文档版本管理**：每次更新创建新版本，保留历史版本用于回溯
- **全文检索**：Elasticsearch实现高效全文搜索，支持关键词、标签、时间范围筛选
- **向量检索**：关键文档生成向量嵌入，支持语义搜索
- **OCR集成**：对扫描版PDF进行OCR识别，提取文本内容

### 3.2 SBOM处理模块

#### 3.2.1 架构设计
```mermaid
graph TD
    SBOM_API[SBOM API] --> SBOM_SERVICE[SBOM处理服务]
    SBOM_SERVICE --> SBOM_CACHE[Redis缓存]
    SBOM_SERVICE --> SBOM_DB[(PostgreSQL)]
    SBOM_SERVICE --> SBOM_STORAGE[MinIO文件存储]
    SBOM_SERVICE --> MQ[消息队列]
    
    SBOM_SERVICE --> PARSER[SBOM解析引擎]
    PARSER --> SPDX[SPDX解析器]
    PARSER --> CYCLONEDX[CycloneDX解析器]
    PARSER --> SWID[SWID解析器]
    PARSER --> CUSTOM[自定义格式解析器]
    
    PARSER --> COMPONENT[组件识别引擎]
    COMPONENT --> LICENSE_DB[许可证数据库]
    COMPONENT --> VULN_DB[漏洞数据库]
    
    MQ --> ASYNC_WORKER[异步处理Worker]
    ASYNC_WORKER --> NOTIFICATION[通知服务]
```

#### 3.2.2 关键设计点
- **多格式支持**：支持SPDX、CycloneDX、SWID等主流SBOM格式
- **异步解析**：大文件上传后通过消息队列异步解析，避免阻塞用户操作
- **组件识别**：自动识别开源组件和许可证，未知组件支持人工标记
- **依赖关系分析**：解析组件间的依赖关系，构建依赖图谱
- **状态管理**：SBOM文件状态流转（Uploaded → Parsed → Reviewing → Completed）

### 3.3 合规评审模块

#### 3.3.1 架构设计
```mermaid
graph TD
    REVIEW_API[评审API] --> REVIEW_SERVICE[合规评审服务]
    REVIEW_SERVICE --> REVIEW_CACHE[Redis缓存]
    REVIEW_SERVICE --> REVIEW_DB[(PostgreSQL)]
    
    REVIEW_SERVICE --> AI_CLIENT[AI服务客户端]
    AI_CLIENT --> AI_SERVICE[AI推理服务]
    
    AI_SERVICE --> KB_RETRIEVER[知识检索器]
    KB_RETRIEVER --> LEGAL_KB[法律知识库]
    KB_RETRIEVER --> INTERNAL_KB[内部知识库]
    
    AI_SERVICE --> RISK_ANALYZER[风险分析引擎]
    RISK_ANALYZER --> LICENSE_CHECK[许可证冲突检测]
    RISK_ANALYZER --> POLICY_CHECK[政策合规检查]
    RISK_ANALYZER --> CASE_MATCHER[案例匹配]
    
    AI_SERVICE --> OPINION_GEN[评审意见生成器]
    OPINION_GEN --> LLM[大语言模型]
    
    REVIEW_SERVICE --> HUMAN_REVIEW[人工评审接口]
    HUMAN_REVIEW --> EDITOR[富文本编辑器]
```

#### 3.3.2 评审逻辑设计
**核心原则**：先应用公开法规，再结合内部知识优化

```mermaid
graph TD
    START[开始评审] --> PARSE_SBOM[解析SBOM组件]
    PARSE_SBOM --> QUERY_LEGAL[查询法律知识库]
    
    QUERY_LEGAL --> LEGAL_RULES[获取相关法律条款]
    LEGAL_RULES --> ANALYZE_RISK[分析合规风险]
    
    ANALYZE_RISK --> QUERY_INTERNAL[查询内部知识库]
    QUERY_INTERNAL --> INTERNAL_GUIDE[获取内部指导/案例]
    
    INTERNAL_GUIDE --> GEN_PRELIM[生成初步评审意见]
    GEN_PRELIM --> AI_OPINION[AI评审意见]
    
    AI_OPINION --> HUMAN_CHECK[人工审阅调整]
    HUMAN_CHECK --> USER_MODIFY[用户修改补充]
    
    USER_MODIFY --> FINAL_CONFIRM[最终确认]
    FINAL_CONFIRM --> GEN_REPORT[生成评审报告]
```

#### 3.3.3 关键设计点
- **双知识库融合**：先查询公开法律知识库，再匹配内部知识库，确保评审意见既合法合规又具针对性
- **风险等级评估**：自动识别许可证冲突、专利风险、版权问题，给出高/中/低风险评级
- **AI模型选择**：使用GPT-4或Claude等先进LLM，结合微调提升专业领域准确性
- **人工干预机制**：提供富文本编辑器，支持律师对AI意见进行修改、补充和确认
- **评审历史追溯**：记录每次评审的完整过程，包括AI原始意见、人工修改内容、最终版本

### 3.4 报告生成模块

#### 3.4.1 架构设计
```mermaid
graph TD
    REPORT_API[报告API] --> REPORT_SERVICE[报告服务]
    REPORT_SERVICE --> REPORT_DB[(PostgreSQL)]
    REPORT_SERVICE --> REPORT_STORAGE[MinIO文件存储]
    
    REPORT_SERVICE --> TEMPLATE_MGR[模板管理器]
    TEMPLATE_MGR --> TEMPLATE_DB[模板数据库]
    
    REPORT_SERVICE --> REPORT_GEN[报告生成引擎]
    REPORT_GEN --> TEMPLATE_ENGINE[模板引擎]
    TEMPLATE_ENGINE --> PLACEHOLDER[占位符替换]
    
    REPORT_GEN --> PDF_GEN[PDF生成器]
    REPORT_GEN --> WORD_GEN[Word生成器]
    
    PDF_GEN --> PDF_LIB[PDF-Lib]
    WORD_GEN --> DOCX_LIB[Docx.js]
    
    REPORT_SERVICE --> ASYNC_GEN[异步生成任务]
    ASYNC_GEN --> MQ[消息队列]
```

#### 3.4.2 关键设计点
- **模板引擎**：使用Handlebars或EJS作为模板引擎，支持动态占位符
- **富文本编辑**：集成Slate.js或ProseMirror，支持所见即所得的模板编辑
- **异步生成**：大报告通过消息队列异步生成，避免超时
- **多格式导出**：支持PDF和Word格式，PDF使用pdf-lib，Word使用docx.js
- **版本管理**：报告模板支持版本管理，可回溯历史版本

## 4. 数据模型设计

### 4.1 数据库选型
- **主数据库**：PostgreSQL 15+
  - 支持复杂查询、事务、JSONB字段
  - 良好的扩展性和性能
  - 丰富的生态工具

- **缓存层**：Redis 7+
  - 会话存储
  - 热点数据缓存
  - 分布式锁

- **搜索引擎**：Elasticsearch 8+
  - 知识库全文检索
  - 复杂查询和聚合

- **向量数据库**：Pinecone 或 Weaviate
  - 文档向量存储
  - 语义搜索

### 4.2 核心数据表结构

#### 4.2.1 用户相关表

```sql
-- 用户表
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active', -- active, inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- 角色表
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50) UNIQUE NOT NULL, -- Admin, Compliance Lawyer, User, Read-Only
    description TEXT,
    permissions JSONB, -- 权限配置
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户角色关联表
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
```

#### 4.2.2 知识库相关表

```sql
-- 知识库表
CREATE TABLE knowledge_bases (
    kb_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kb_name VARCHAR(100) NOT NULL, -- 法律知识库、内部知识库
    description TEXT,
    type VARCHAR(20) NOT NULL, -- legal, internal
    access_control JSONB, -- 访问权限配置
    creator_id UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 知识文档表
CREATE TABLE knowledge_documents (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kb_id UUID REFERENCES knowledge_bases(kb_id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT, -- Markdown格式
    content_vector VECTOR(1536), -- 向量嵌入
    original_filename VARCHAR(500),
    file_type VARCHAR(50),
    file_path VARCHAR(1000),
    file_size BIGINT,
    uploader_id UUID REFERENCES users(user_id),
    version INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active', -- active, archived
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文档版本历史表
CREATE TABLE document_versions (
    version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id UUID REFERENCES knowledge_documents(doc_id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    content TEXT,
    change_summary TEXT,
    changed_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文档标签表
CREATE TABLE document_tags (
    tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_name VARCHAR(100) UNIQUE NOT NULL,
    kb_id UUID REFERENCES knowledge_bases(kb_id), -- 可选，全局标签可为NULL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文档标签关联表
CREATE TABLE doc_tag_relations (
    doc_id UUID REFERENCES knowledge_documents(doc_id) ON DELETE CASCADE,
    tag_id UUID REFERENCES document_tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (doc_id, tag_id)
);
```

#### 4.2.3 SBOM相关表

```sql
-- SBOM文件表
CREATE TABLE sbom_files (
    sbom_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(500) NOT NULL,
    original_file_path VARCHAR(1000),
    file_size BIGINT,
    file_hash VARCHAR(128), -- SHA256
    format VARCHAR(50), -- SPDX, CycloneDX, SWID
    version VARCHAR(50),
    uploader_id UUID REFERENCES users(user_id),
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'uploaded', -- uploaded, parsed, reviewing, completed, failed
    parse_result JSONB, -- 解析结果元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SBOM组件表
CREATE TABLE sbom_components (
    component_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sbom_id UUID REFERENCES sbom_files(sbom_id) ON DELETE CASCADE,
    component_name VARCHAR(500) NOT NULL,
    version VARCHAR(100),
    supplier VARCHAR(500),
    license_id UUID REFERENCES licenses(license_id),
    license_expression VARCHAR(500),
    component_type VARCHAR(50), -- Library, Framework, Application
    description TEXT,
    homepage_url VARCHAR(1000),
    source_url VARCHAR(1000),
    checksum VARCHAR(128),
    dependencies JSONB, -- 依赖关系
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 许可证表
CREATE TABLE licenses (
    license_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_name VARCHAR(200) UNIQUE NOT NULL, -- MIT, Apache-2.0
    spdx_identifier VARCHAR(50) UNIQUE,
    description TEXT,
    risk_level VARCHAR(20), -- High, Medium, Low
    obligations JSONB, -- 许可证义务
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.2.4 评审相关表

```sql
-- 评审结果表
CREATE TABLE review_results (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sbom_id UUID REFERENCES sbom_files(sbom_id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(user_id),
    review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'draft', -- draft, completed
    risk_summary TEXT,
    risk_level VARCHAR(20), -- High, Medium, Low
    legal_basis TEXT, -- 法律依据
    internal_guidance TEXT, -- 内部指导
    final_opinion TEXT, -- 最终评审意见
    ai_opinion TEXT, -- AI原始意见
    ai_model_version VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 风险点明细表
CREATE TABLE risk_items (
    risk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES review_results(review_id) ON DELETE CASCADE,
    component_id UUID REFERENCES sbom_components(component_id),
    risk_type VARCHAR(100), -- LicenseConflict, PatentRisk, CopyrightIssue
    risk_level VARCHAR(20), -- High, Medium, Low
    description TEXT,
    legal_reference UUID REFERENCES knowledge_documents(doc_id),
    internal_reference UUID REFERENCES knowledge_documents(doc_id),
    mitigation_suggestion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评审报告表
CREATE TABLE review_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES review_results(review_id) ON DELETE CASCADE,
    template_id UUID REFERENCES report_templates(template_id),
    generated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(1000),
    file_name VARCHAR(500),
    file_format VARCHAR(20), -- PDF, Word
    file_size BIGINT,
    created_by UUID REFERENCES users(user_id)
);

-- 报告模板表
CREATE TABLE report_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(200) NOT NULL,
    content TEXT, -- 模板内容（含占位符）
    template_type VARCHAR(50), -- standard, custom
    creator_id UUID REFERENCES users(user_id),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.2.5 系统相关表

```sql
-- 系统配置表
CREATE TABLE system_configs (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(200) UNIQUE NOT NULL,
    config_value JSONB,
    config_type VARCHAR(50), -- basic, notification, backup
    description TEXT,
    updated_by UUID REFERENCES users(user_id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 操作日志表
CREATE TABLE operation_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    operation_type VARCHAR(100), -- Login, UploadSBOM, EditKB, GenerateReport
    operation_details JSONB,
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) -- success, failure
);

-- 数据备份记录表
CREATE TABLE backup_records (
    backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_type VARCHAR(50), -- full, incremental
    backup_path VARCHAR(1000),
    backup_size BIGINT,
    status VARCHAR(20), -- running, completed, failed
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_by UUID REFERENCES users(user_id)
);
```

### 4.3 索引设计

```sql
-- 用户表索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);

-- 知识文档表索引
CREATE INDEX idx_knowledge_documents_kb_id ON knowledge_documents(kb_id);
CREATE INDEX idx_knowledge_documents_uploader ON knowledge_documents(uploader_id);
CREATE INDEX idx_knowledge_documents_created_at ON knowledge_documents(created_at);
CREATE INDEX idx_knowledge_documents_title ON knowledge_documents USING gin(to_tsvector('chinese', title));
CREATE INDEX idx_knowledge_documents_content ON knowledge_documents USING gin(to_tsvector('chinese', content));

-- SBOM文件表索引
CREATE INDEX idx_sbom_files_uploader ON sbom_files(uploader_id);
CREATE INDEX idx_sbom_files_status ON sbom_files(status);
CREATE INDEX idx_sbom_files_upload_time ON sbom_files(upload_time);

-- SBOM组件表索引
CREATE INDEX idx_sbom_components_sbom_id ON sbom_components(sbom_id);
CREATE INDEX idx_sbom_components_license ON sbom_components(license_id);
CREATE INDEX idx_sbom_components_name ON sbom_components(component_name);

-- 评审结果表索引
CREATE INDEX idx_review_results_sbom_id ON review_results(sbom_id);
CREATE INDEX idx_review_results_reviewer ON review_results(reviewer_id);
CREATE INDEX idx_review_results_status ON review_results(status);
CREATE INDEX idx_review_results_review_time ON review_results(review_time);

-- 操作日志表索引
CREATE INDEX idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX idx_operation_logs_operation_type ON operation_logs(operation_type);
CREATE INDEX idx_operation_logs_operation_time ON operation_logs(operation_time);
```

## 5. API接口设计

### 5.1 接口规范

- **协议**：HTTPS
- **格式**：RESTful + JSON
- **版本**：v1
- **认证**：JWT Bearer Token
- **分页**：统一分页参数 `page`, `pageSize`, `total`, `items`
- **排序**：`sortBy`, `sortOrder` (asc/desc)
- **过滤**：统一过滤参数 `filters`

### 5.2 认证接口

```typescript
// 登录
POST /api/v1/auth/login
Request: {
  username: string;
  password: string;
}
Response: {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
  expiresIn: number;
}

// 刷新Token
POST /api/v1/auth/refresh
Request: {
  refreshToken: string;
}
Response: {
  accessToken: string;
  expiresIn: number;
}

// 获取当前用户信息
GET /api/v1/auth/me
Response: UserDTO
```

### 5.3 知识库管理接口

```typescript
// 获取知识库列表
GET /api/v1/knowledge-bases
Query: {
  page?: number;
  pageSize?: number;
  type?: 'legal' | 'internal';
}
Response: Paginated<KnowledgeBaseDTO>

// 创建知识库
POST /api/v1/knowledge-bases
Request: {
  name: string;
  description?: string;
  type: 'legal' | 'internal';
  accessControl?: object;
}
Response: KnowledgeBaseDTO

// 获取知识库详情
GET /api/v1/knowledge-bases/:kbId
Response: KnowledgeBaseDetailDTO

// 更新知识库
PUT /api/v1/knowledge-bases/:kbId
Request: Partial<KnowledgeBaseDTO>
Response: KnowledgeBaseDTO

// 删除知识库
DELETE /api/v1/knowledge-bases/:kbId
Response: void

// 获取知识文档列表
GET /api/v1/knowledge-bases/:kbId/documents
Query: {
  page?: number;
  pageSize?: number;
  search?: string;
  tags?: string[];
  fileType?: string;
  startDate?: string;
  endDate?: string;
}
Response: Paginated<KnowledgeDocumentDTO>

// 上传知识文档
POST /api/v1/knowledge-bases/:kbId/documents
Content-Type: multipart/form-data
Request: {
  file: File;
  tags?: string[];
  autoExtractTags?: boolean;
}
Response: KnowledgeDocumentDTO

// 更新知识文档
PUT /api/v1/knowledge-bases/:kbId/documents/:docId
Request: {
  title?: string;
  content?: string;
  tags?: string[];
}
Response: KnowledgeDocumentDTO

// 删除知识文档
DELETE /api/v1/knowledge-bases/:kbId/documents/:docId
Response: void

// 全文搜索
GET /api/v1/knowledge-bases/:kbId/search
Query: {
  q: string;
  searchType?: 'fulltext' | 'semantic';
  tags?: string[];
  limit?: number;
}
Response: SearchResultDTO[]
```

### 5.4 SBOM管理接口

```typescript
// 获取SBOM列表
GET /api/v1/sboms
Query: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  uploaderId?: string;
  startDate?: string;
  endDate?: string;
}
Response: Paginated<SBOMFileDTO>

// 上传SBOM文件
POST /api/v1/sboms/upload
Content-Type: multipart/form-data
Request: {
  file: File;
  description?: string;
}
Response: SBOMFileDTO

// 获取SBOM详情
GET /api/v1/sboms/:sbomId
Response: SBOMDetailDTO

// 获取SBOM组件列表
GET /api/v1/sboms/:sbomId/components
Query: {
  page?: number;
  pageSize?: number;
  search?: string;
  licenseId?: string;
  riskLevel?: string;
}
Response: Paginated<SBOMComponentDTO>

// 触发SBOM解析
POST /api/v1/sboms/:sbomId/parse
Response: {
  taskId: string;
  status: string;
}

// 获取解析状态
GET /api/v1/sboms/:sbomId/parse-status
Response: {
  taskId: string;
  status: string;
  progress: number;
  result?: object;
}
```

### 5.5 合规评审接口

```typescript
// 创建评审任务
POST /api/v1/reviews
Request: {
  sbomId: string;
  reviewerId?: string;
}
Response: ReviewResultDTO

// 获取评审列表
GET /api/v1/reviews
Query: {
  page?: number;
  pageSize?: number;
  sbomId?: string;
  reviewerId?: string;
  status?: string;
}
Response: Paginated<ReviewResultDTO>

// 获取评审详情
GET /api/v1/reviews/:reviewId
Response: ReviewDetailDTO

// 触发AI评审
POST /api/v1/reviews/:reviewId/ai-review
Response: {
  taskId: string;
  status: string;
}

// 获取AI评审状态
GET /api/v1/reviews/:reviewId/ai-review-status
Response: {
  taskId: string;
  status: string;
  aiOpinion?: string;
  riskItems?: RiskItemDTO[];
}

// 更新评审结果
PUT /api/v1/reviews/:reviewId
Request: {
  finalOpinion?: string;
  riskSummary?: string;
  riskLevel?: string;
  legalBasis?: string;
  internalGuidance?: string;
  status?: 'draft' | 'completed';
}
Response: ReviewResultDTO

// 获取风险点列表
GET /api/v1/reviews/:reviewId/risk-items
Response: RiskItemDTO[]

// 更新风险点
PUT /api/v1/reviews/:reviewId/risk-items/:riskId
Request: Partial<RiskItemDTO>
Response: RiskItemDTO
```

### 5.6 报告管理接口

```typescript
// 获取报告模板列表
GET /api/v1/report-templates
Query: {
  page?: number;
  pageSize?: number;
  type?: string;
}
Response: Paginated<ReportTemplateDTO>

// 创建报告模板
POST /api/v1/report-templates
Request: {
  name: string;
  content: string;
  type?: string;
  isDefault?: boolean;
}
Response: ReportTemplateDTO

// 更新报告模板
PUT /api/v1/report-templates/:templateId
Request: Partial<ReportTemplateDTO>
Response: ReportTemplateDTO

// 删除报告模板
DELETE /api/v1/report-templates/:templateId
Response: void

// 生成评审报告
POST /api/v1/reports/generate
Request: {
  reviewId: string;
  templateId: string;
  format: 'pdf' | 'word';
  fileName?: string;
}
Response: {
  taskId: string;
  status: string;
}

// 获取报告生成状态
GET /api/v1/reports/generate/:taskId/status
Response: {
  taskId: string;
  status: string;
  reportId?: string;
  downloadUrl?: string;
}

// 获取报告列表
GET /api/v1/reports
Query: {
  page?: number;
  pageSize?: number;
  reviewId?: string;
  generatedBy?: string;
  startDate?: string;
  endDate?: string;
}
Response: Paginated<ReviewReportDTO>

// 下载报告
GET /api/v1/reports/:reportId/download
Response: File stream
```

### 5.7 系统设置接口

```typescript
// 获取系统配置
GET /api/v1/system/configs
Query: {
  type?: string;
}
Response: SystemConfigDTO[]

// 更新系统配置
PUT /api/v1/system/configs/:configKey
Request: {
  configValue: any;
}
Response: SystemConfigDTO

// 获取操作日志
GET /api/v1/system/logs
Query: {
  page?: number;
  pageSize?: number;
  userId?: string;
  operationType?: string;
  startDate?: string;
  endDate?: string;
}
Response: Paginated<OperationLogDTO>

// 触发数据备份
POST /api/v1/system/backups
Request: {
  backupType: 'full' | 'incremental';
}
Response: {
  backupId: string;
  status: string;
}

// 获取备份状态
GET /api/v1/system/backups/:backupId/status
Response: BackupRecordDTO

// 获取备份列表
GET /api/v1/system/backups
Query: {
  page?: number;
  pageSize?: number;
  status?: string;
}
Response: Paginated<BackupRecordDTO>
```

## 6. 安全机制设计

### 6.1 认证与授权

#### 6.1.1 JWT认证流程
```mermaid
sequenceDiagram
    participant Client
    participant AuthService
    participant UserService
    participant Redis
    
    Client->>AuthService: POST /login (username, password)
    AuthService->>UserService: 验证用户凭证
    UserService-->>AuthService: 用户信息和权限
    AuthService->>AuthService: 生成JWT Token
    AuthService->>Redis: 存储Token黑名单
    AuthService-->>Client: {accessToken, refreshToken, user}
    
    Client->>AuthService: 请求 (Header: Authorization: Bearer <token>)
    AuthService->>Redis: 检查Token是否失效
    Redis-->>AuthService: Token状态
    AuthService->>AuthService: 验证Token签名和过期时间
    AuthService-->>Client: 请求资源
    
    Client->>AuthService: POST /refresh (refreshToken)
    AuthService->>AuthService: 验证refreshToken
    AuthService->>AuthService: 生成新的accessToken
    AuthService-->>Client: {accessToken, expiresIn}
```

#### 6.1.2 权限模型
采用**RBAC（基于角色的访问控制）**模型：

- **角色定义**：
  - `Admin`：系统管理员，拥有所有权限
  - `Compliance Lawyer`：合规律师，可进行评审、管理知识库
  - `User`：普通用户，可上传SBOM、查看报告
  - `Read-Only`：只读用户，仅可查看

- **权限粒度**：
  - 菜单级别：控制访问哪些页面
  - 操作级别：控制按钮操作（创建、编辑、删除）
  - 数据级别：控制查看哪些数据（知识库隔离）

#### 6.1.3 权限验证流程
```typescript
// 权限装饰器示例
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('sbom:upload', 'sbom:view')
@Controller('sboms')
export class SBOMController {
  @Post('upload')
  async uploadSBOM(@Req() req, @UploadedFile() file) {
    // 只有具有sbom:upload权限的用户可以访问
  }
}
```

### 6.2 数据安全

#### 6.2.1 敏感数据加密
- **密码加密**：使用bcrypt算法，salt rounds = 12
- **文件加密**：重要文件使用AES-256加密存储
- **数据库加密**：敏感字段使用pgcrypto扩展加密

```sql
-- 密码加密示例
INSERT INTO users (username, password_hash, email)
VALUES (
  'user@example.com',
  crypt('password', gen_salt('bf', 12)),
  'user@example.com'
);

-- 敏感字段加密
INSERT INTO system_configs (config_key, config_value)
VALUES (
  'smtp_password',
  pgp_sym_encrypt('smtp_password_value', 'encryption_key')
);
```

#### 6.2.2 数据传输安全
- **HTTPS强制**：所有API接口强制使用HTTPS
- **CORS配置**：严格配置跨域策略
- **HSTS**：启用HTTP严格传输安全

```typescript
// NestJS安全中间件配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
});
```

#### 6.2.3 文件安全
- **文件类型验证**：严格验证上传文件类型
- **文件大小限制**：限制单个文件最大大小（如100MB）
- **病毒扫描**：集成ClamAV进行病毒扫描
- **存储隔离**：不同租户文件存储隔离

```typescript
// 文件上传验证
const ALLOWED_MIME_TYPES = {
  'sbom': ['application/json', 'text/xml', 'application/xml'],
  'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'],
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

@UseInterceptors(FileInterceptor('file', {
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.sbom.includes(file.mimetype)) {
      return callback(new Error('不支持的文件类型'), false);
    }
    callback(null, true);
  },
}))
```

### 6.3 审计与日志

#### 6.3.1 操作日志记录
记录所有关键操作，包括：
- 用户登录/登出
- SBOM文件上传/删除
- 知识库文档创建/编辑/删除
- 评审结果确认
- 报告生成
- 系统配置修改

```typescript
// 操作日志拦截器
@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const operationType = this.getOperationType(context);
    
    return next.handle().pipe(
      tap(() => {
        this.logService.create({
          userId: user?.userId,
          operationType,
          operationDetails: {
            method: request.method,
            url: request.url,
            body: request.body,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
          },
          ipAddress: request.ip,
          status: 'success',
        });
      }),
      catchError((error) => {
        this.logService.create({
          userId: user?.userId,
          operationType,
          operationDetails: {
            method: request.method,
            url: request.url,
            error: error.message,
          },
          ipAddress: request.ip,
          status: 'failure',
        });
        throw error;
      }),
    );
  }
}
```

#### 6.3.2 日志保留策略
- **操作日志**：保留2年
- **系统日志**：保留30天
- **错误日志**：保留90天
- **备份日志**：保留1年

## 7. 性能优化设计

### 7.1 缓存策略

#### 7.1.1 多级缓存架构
```mermaid
graph TD
    Client[客户端]
    CDN[CDN缓存]
    Browser[浏览器缓存]
    LB[负载均衡]
    
    Client --> Browser
    Browser --> CDN
    CDN --> LB
    
    LB --> API[API服务]
    API --> Cache1[本地缓存 Caffeine]
    API --> Cache2[Redis缓存]
    
    Cache2 --> DB[(PostgreSQL)]
    Cache1 --> DB
    
    Cache2 --> ES[Elasticsearch]
```

#### 7.1.2 缓存策略
- **浏览器缓存**：静态资源（JS、CSS、图片）设置长期缓存
- **CDN缓存**：公共静态资源、文档预览图片
- **Redis缓存**：
  - 用户会话信息（TTL: 24小时）
  - 热点知识库文档（TTL: 1小时）
  - SBOM解析结果（TTL: 30分钟）
  - 许可证信息（TTL: 24小时）
- **本地缓存**：使用Caffeine缓存常用配置数据

```typescript
// Redis缓存配置
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.cacheManager.store.keys(pattern);
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }
}
```

### 7.2 异步处理

#### 7.2.1 异步任务场景
- SBOM文件解析
- AI合规评审
- 报告生成
- 知识库文档索引构建
- 数据备份

#### 7.2.2 消息队列设计
```typescript
// 任务队列定义
enum TaskQueue {
  SBOM_PARSE = 'sbom-parse',
  AI_REVIEW = 'ai-review',
  REPORT_GENERATE = 'report-generate',
  KB_INDEX = 'kb-index',
  DATA_BACKUP = 'data-backup',
}

// 任务处理器
@Processor(TaskQueue.SBOM_PARSE)
export class SBOMParseProcessor {
  constructor(
    private readonly sbomService: SBOMService,
    private readonly notificationService: NotificationService,
  ) {}

  @Process()
  async handleParse(job: Job<SBOMParseJob>) {
    const { sbomId, filePath, format } = job.data;
    
    try {
      // 解析SBOM文件
      const result = await this.sbomService.parseSBOMFile(filePath, format);
      
      // 更新SBOM状态
      await this.sbomService.updateStatus(sbomId, 'parsed', result);
      
      // 发送通知
      await this.notificationService.sendNotification({
        userId: job.data.uploaderId,
        type: 'sbom_parsed',
        message: `SBOM文件 ${job.data.fileName} 解析完成`,
        data: { sbomId },
      });
      
      return result;
    } catch (error) {
      await this.sbomService.updateStatus(sbomId, 'failed', { error: error.message });
      throw error;
    }
  }
}
```

### 7.3 数据库优化

#### 7.3.1 查询优化
- **索引优化**：为高频查询字段创建复合索引
- **查询缓存**：开启PostgreSQL查询缓存
- **连接池**：使用PgBouncer管理数据库连接
- **读写分离**：主库写入，从库读取

```sql
-- 复合索引示例
CREATE INDEX idx_sbom_components_search ON sbom_components(sbom_id, component_name, license_id);
CREATE INDEX idx_knowledge_documents_full_search ON knowledge_documents(kb_id, status, created_at);

-- 分区表设计（大表优化）
CREATE TABLE sbom_components_partitioned (
    LIKE sbom_components INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE sbom_components_2024_q1 PARTITION OF sbom_components_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

#### 7.3.2 批量操作优化
```typescript
// 批量插入优化
async batchInsertComponents(components: SBOMComponentDTO[]): Promise<void> {
  const batchSize = 1000;
  for (let i = 0; i < components.length; i += batchSize) {
    const batch = components.slice(i, i + batchSize);
    await this.prisma.sbomComponent.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
}
```

### 7.4 前端性能优化

#### 7.4.1 代码分割
```typescript
// React路由懒加载
const SBOMList = lazy(() => import('./pages/p-sbom_list'));
const KBDetail = lazy(() => import('./pages/p-kb_detail'));
const ReviewResult = lazy(() => import('./pages/p-review_result'));

<Router>
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/sboms" element={<SBOMList />} />
      <Route path="/knowledge-bases/:kbId" element={<KBDetail />} />
      <Route path="/reviews/:reviewId" element={<ReviewResult />} />
    </Routes>
  </Suspense>
</Router>
```

#### 7.4.2 数据获取优化
```typescript
// React Query缓存配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

// 分页数据缓存
const useSBOMList = (page: number, pageSize: number, filters: any) => {
  return useQuery(
    ['sboms', page, pageSize, filters],
    () => fetchSBOMList(page, pageSize, filters),
    {
      keepPreviousData: true, // 保持旧数据，提升用户体验
    }
  );
};
```

## 8. AI集成设计

### 8.1 AI服务架构

```mermaid
graph TB
    subgraph "后端服务"
        REVIEW_SERVICE[合规评审服务]
        KB_SERVICE[知识库服务]
    end
    
    subgraph "AI服务层"
        AI_GATEWAY[AI Gateway]
        EMBED_SERVICE[嵌入服务]
        LLM_SERVICE[大语言模型服务]
        RERANK_SERVICE[重排序服务]
    end
    
    subgraph "数据层"
        VDB[(向量数据库)]
        KNOWLEDGE_DB[(知识库)]
        CACHE[(Redis缓存)]
    end
    
    REVIEW_SERVICE --> AI_GATEWAY
    KB_SERVICE --> AI_GATEWAY
    
    AI_GATEWAY --> EMBED_SERVICE
    AI_GATEWAY --> LLM_SERVICE
    AI_GATEWAY --> RERANK_SERVICE
    
    EMBED_SERVICE --> VDB
    LLM_SERVICE --> VDB
    LLM_SERVICE --> KNOWLEDGE_DB
    RERANK_SERVICE --> VDB
    
    VDB --> CACHE
    KNOWLEDGE_DB --> CACHE
```

### 8.2 知识检索流程

```mermaid
sequenceDiagram
    participant ReviewService
    participant AIGateway
    participant EmbedService
    participant VectorDB
    participant LLMService
    participant KnowledgeDB
    
    ReviewService->>AIGateway: 发送评审请求(sbomComponents)
    
    loop 对每个组件
        AIGateway->>EmbedService: 生成查询嵌入(queryEmbedding)
        EmbedService-->>AIGateway: 嵌入向量
        
        AIGateway->>VectorDB: 相似度搜索(topK=10)
        VectorDB-->>AIGateway: 相关文档片段
        
        AIGateway->>KnowledgeDB: 查询法律条款
        KnowledgeDB-->>AIGateway: 法律条款内容
        
        AIGateway->>KnowledgeDB: 查询内部案例
        KnowledgeDB-->>AIGateway: 内部指导内容
    end
    
    AIGateway->>LLMService: 生成评审意见(prompt+context)
    LLMService-->>AIGateway: AI评审意见
    
    AIGateway-->>ReviewService: 返回评审结果
```

### 8.3 Prompt工程

#### 8.3.1 评审意见生成Prompt
```typescript
const REVIEW_PROMPT_TEMPLATE = `
你是一位专业的开源合规法律顾问。请根据以下信息，对开源组件的合规性进行评审。

## SBOM组件信息
{componentInfo}

## 相关法律条款
{legalBasis}

## 内部指导与案例
{internalGuidance}

## 评审要求
1. 分析该组件的许可证合规性
2. 识别潜在的专利风险、版权风险
3. 评估许可证冲突可能性
4. 提供具体的合规建议
5. 给出风险等级（高/中/低）

## 输出格式
请按以下JSON格式输出：

\`\`\`json
{{
  "riskLevel": "高|中|低",
  "riskSummary": "风险概述",
  "legalAnalysis": "法律分析",
  "complianceSuggestions": ["建议1", "建议2"],
  "references": {{
    "legal": ["法律条款1", "法律条款2"],
    "internal": ["内部指导1", "案例1"]
  }}
}}
\`\`\`

请确保分析准确、专业，并严格遵循相关法律法规和内部指导。
`;
```

#### 8.3.2 知识检索Prompt
```typescript
const KNOWLEDGE_RETRIEVAL_PROMPT = `
请根据以下查询，从知识库中检索最相关的法律条款和内部指导。

## 查询内容
{query}

## 检索要求
1. 优先检索最新的法律法规
2. 匹配最相关的内部案例和最佳实践
3. 考虑组件类型和行业特点
4. 返回最相关的5-10条结果

## 输出格式
返回JSON数组，每条包含：
- type: "legal" | "internal"
- relevance: 0-1的相似度分数
- content: 相关内容摘要
- source: 来源文档ID
- title: 文档标题
`;
```

### 8.4 模型选择与优化

#### 8.4.1 模型配置
- **嵌入模型**：text-embedding-ada-002 或 bge-large-zh
- **大语言模型**：GPT-4-turbo 或 Claude-3-sonnet
- **重排序模型**：bge-reranker-large

#### 8.4.2 模型优化策略
- **缓存嵌入向量**：避免重复计算
- **批量处理**：批量生成嵌入和调用LLM
- **流式响应**：大文本生成使用流式响应
- **错误重试**：实现指数退避重试机制

```typescript
// AI服务客户端
@Injectable()
export class AIServiceClient {
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000;

  async generateEmbedding(text: string): Promise<number[]> {
    const cacheKey = `embed:${hash(text)}`;
    const cached = await this.cacheService.get<number[]>(cacheKey);
    if (cached) return cached;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: text,
        });
        
        const embedding = response.data[0].embedding;
        await this.cacheService.set(cacheKey, embedding, 24 * 3600); // 缓存24小时
        
        return embedding;
      } catch (error) {
        if (attempt === this.maxRetries - 1) throw error;
        await this.sleep(this.baseDelay * Math.pow(2, attempt));
      }
    }
  }

  async generateReviewOpinion(prompt: string): Promise<string> {
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
    }

    return fullResponse;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 9. 部署与运维

### 9.1 Docker容器化

#### 9.1.1 服务Dockerfile示例
```dockerfile
# 后端API服务
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start:prod"]

# AI服务
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 9.1.2 Docker Compose配置
```yaml
version: '3.8'

services:
  # 前端
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - API_URL=http://backend:3000

  # 后端API
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/compliance_db
      - REDIS_URL=redis://redis:6379
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - MINIO_ENDPOINT=minio:9000
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - postgres
      - redis
      - elasticsearch
      - minio
      - ai-service

  # AI服务
  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - VECTOR_DB_URL=http://vector-db:8080
    depends_on:
      - vector-db

  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=compliance_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  # Redis缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Elasticsearch
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  # MinIO对象存储
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  # 向量数据库
  vector-db:
    image: semitechnologies/weaviate:1.23.0
    environment:
      - QUERY_DEFAULTS_LIMIT=25
      - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
    ports:
      - "8080:8080"
    volumes:
      - vector_db_data:/var/lib/weaviate

  # Nginx负载均衡
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
  minio_data:
  vector_db_data:
```

### 9.2 CI/CD流程

#### 9.2.1 GitHub Actions工作流
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push Docker images
        run: |
          docker-compose build
          docker-compose push
      
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/compliance-system
            docker-compose pull
            docker-compose up -d
```

### 9.3 监控与告警

#### 9.3.1 Prometheus监控指标
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend-api'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
  
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

#### 9.3.2 关键监控指标
- **API性能**：请求延迟、QPS、错误率
- **数据库**：连接数、查询延迟、慢查询
- **缓存**：命中率、内存使用
- **文件存储**：存储空间、上传/下载速度
- **AI服务**：调用延迟、成功率、Token消耗
- **系统资源**：CPU、内存、磁盘、网络

#### 9.3.3 Grafana监控大盘
- **业务大盘**：SBOM处理量、评审完成率、报告生成量
- **技术大盘**：API性能、数据库性能、缓存命中率
- **AI服务大盘**：模型调用情况、响应时间、成本分析

### 9.4 备份与恢复

#### 9.4.1 备份策略
- **数据库**：每日全量备份 + 每小时增量备份
- **文件存储**：每日增量备份到异地存储
- **配置备份**：每次配置变更时自动备份

#### 9.4.2 自动化备份脚本
```bash
#!/bin/bash
# backup.sh

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/$BACKUP_DATE"

# 创建备份目录
mkdir -p $BACKUP_DIR

# PostgreSQL备份
pg_dump -h postgres -U user compliance_db > $BACKUP_DIR/database.sql

# MinIO备份
mc mirror minio/compliance-bucket $BACKUP_DIR/files

# 压缩备份
tar -czf /backup/compliance_backup_$BACKUP_DATE.tar.gz $BACKUP_DIR

# 上传到S3
aws s3 cp /backup/compliance_backup_$BACKUP_DATE.tar.gz s3://compliance-backups/

# 清理旧备份（保留30天）
find /backup -name "*.tar.gz" -mtime +30 -delete

# 记录备份日志
echo "[$BACKUP_DATE] Backup completed" >> /backup/backup.log
```

## 10. 扩展性设计

### 10.1 水平扩展

#### 10.1.1 服务无状态化
- **API服务**：不保存会话状态，使用JWT认证
- **AI服务**：无状态设计，支持多实例部署
- **文件处理**：任务状态存储在数据库，支持分布式处理

#### 10.1.2 负载均衡
```nginx
# Nginx负载均衡配置
upstream backend_api {
    least_conn;
    server backend1:3000 max_fails=3 fail_timeout=30s;
    server backend2:3000 max_fails=3 fail_timeout=30s;
    server backend3:3000 max_fails=3 fail_timeout=30s;
}

upstream ai_service {
    ip_hash;
    server ai1:8000;
    server ai2:8000;
    server ai3:8000;
}

server {
    listen 80;
    
    location /api/ {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /ai/ {
        proxy_pass http://ai_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 10.2 插件化架构

#### 10.2.1 SBOM解析器插件
```typescript
// SBOM解析器接口
interface ISBOMParser {
  format: string; // SPDX, CycloneDX, SWID
  supportedVersions: string[];
  parse(filePath: string): Promise<SBOMParseResult>;
}

// 插件注册
@Injectable()
export class SBOMParserRegistry {
  private parsers = new Map<string, ISBOMParser>();

  register(parser: ISBOMParser): void {
    this.parsers.set(parser.format, parser);
  }

  getParser(format: string): ISBOMParser {
    const parser = this.parsers.get(format);
    if (!parser) {
      throw new Error(`Unsupported SBOM format: ${format}`);
    }
    return parser;
  }
}

// 自定义解析器示例
@Injectable()
export class CustomSBOMParser implements ISBOMParser {
  format = 'custom';
  supportedVersions = ['1.0', '2.0'];

  async parse(filePath: string): Promise<SBOMParseResult> {
    // 自定义解析逻辑
    const content = await fs.readFile(filePath, 'utf-8');
    return this.parseCustomFormat(content);
  }
}
```

#### 10.2.2 AI模型插件
```typescript
// AI模型接口
interface IAIModel {
  name: string;
  type: 'embedding' | 'llm';
  generateEmbedding(text: string): Promise<number[]>;
  generateText(prompt: string, options?: any): Promise<string>;
}

// 多模型支持
@Injectable()
export class AIModelManager {
  private models = new Map<string, IAIModel>();

  async generateEmbedding(text: string): Promise<number[]> {
    const model = this.getModel('embedding');
    return model.generateEmbedding(text);
  }

  async generateReviewOpinion(prompt: string): Promise<string> {
    const model = this.getModel('llm');
    return model.generateText(prompt, {
      temperature: 0.3,
      maxTokens: 2000,
    });
  }
}
```

### 10.3 多租户支持

#### 10.3.1 租户隔离方案
```typescript
// 租户上下文
@Injectable()
export class TenantContext {
  private tenantIdStore = new AsyncLocalStorage<string>();

  getTenantId(): string | undefined {
    return this.tenantIdStore.getStore();
  }

  run(tenantId: string, callback: () => void): void {
    this.tenantIdStore.run(tenantId, callback);
  }
}

// 租户拦截器
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private tenantContext: TenantContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || 'default';
    
    return new Observable(observer => {
      this.tenantContext.run(tenantId, () => {
        next.handle().subscribe({
          next: (value) => observer.next(value),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      });
    });
  }
}

// 租户数据过滤
@Injectable()
export class TenantPrismaMiddleware implements Prisma.Middleware {
  async use(params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) {
    const tenantContext = new TenantContext();
    const tenantId = tenantContext.getTenantId();
    
    if (tenantId && params.model && this.isTenantModel(params.model)) {
      if (!params.args.where) {
        params.args.where = {};
      }
      params.args.where.tenantId = tenantId;
    }
    
    return next(params);
  }

  private isTenantModel(model: string): boolean {
    const tenantModels = ['knowledge_bases', 'sbom_files', 'users'];
    return tenantModels.includes(model);
  }
}
```

## 11. 测试策略

### 11.1 测试金字塔
- **单元测试**：覆盖率 > 80%
- **集成测试**：覆盖核心业务流程
- **E2E测试**：覆盖关键用户旅程
- **性能测试**：模拟高并发场景

### 11.2 测试环境
- **开发环境**：本地Docker环境
- **测试环境**：独立的测试数据库和AI服务
- **预生产环境**：与生产环境配置一致
- **生产环境**：灰度发布，逐步放量

### 11.3 自动化测试
```typescript
// API集成测试示例
describe('SBOM Review Flow', () => {
  it('should complete full SBOM review workflow', async () => {
    // 1. 上传SBOM文件
    const uploadResponse = await request(app)
      .post('/api/v1/sboms/upload')
      .attach('file', './test/fixtures/sample-sbom.json')
      .set('Authorization', `Bearer ${token}`);
    
    expect(uploadResponse.status).toBe(201);
    const sbomId = uploadResponse.body.sbomId;

    // 2. 等待解析完成
    await waitForSBOMParse(sbomId);

    // 3. 创建评审
    const reviewResponse = await request(app)
      .post('/api/v1/reviews')
      .send({ sbomId })
      .set('Authorization', `Bearer ${token}`);
    
    expect(reviewResponse.status).toBe(201);
    const reviewId = reviewResponse.body.reviewId;

    // 4. 触发AI评审
    const aiReviewResponse = await request(app)
      .post(`/api/v1/reviews/${reviewId}/ai-review`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(aiReviewResponse.status).toBe(202);

    // 5. 等待AI评审完成
    await waitForAIReview(reviewId);

    // 6. 获取评审结果
    const reviewResult = await request(app)
      .get(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(reviewResult.status).toBe(200);
    expect(reviewResult.body.aiOpinion).toBeDefined();
    expect(reviewResult.body.riskItems).toBeDefined();

    // 7. 生成报告
    const reportResponse = await request(app)
      .post('/api/v1/reports/generate')
      .send({
        reviewId,
        templateId: 'default-template',
        format: 'pdf',
      })
      .set('Authorization', `Bearer ${token}`);
    
    expect(reportResponse.status).toBe(202);
    const taskId = reportResponse.body.taskId;

    // 8. 等待报告生成
    await waitForReportGeneration(taskId);

    // 9. 下载报告
    const downloadResponse = await request(app)
      .get(`/api/v1/reports/${reportId}/download`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(downloadResponse.status).toBe(200);
    expect(downloadResponse.headers['content-type']).toBe('application/pdf');
  });
});
```

## 12. 总结

本设计文档详细阐述了开源合规智能助手系统的技术架构和实现方案，涵盖了：

1. **系统架构**：采用微服务架构，前后端分离，支持水平扩展
2. **核心模块**：知识库管理、SBOM处理、合规评审、报告生成四大核心模块
3. **数据模型**：详细的数据库设计，支持多租户和复杂业务场景
4. **API设计**：RESTful风格的API，统一规范，易于使用
5. **安全机制**：JWT认证、RBAC权限、数据加密、审计日志
6. **性能优化**：多级缓存、异步处理、数据库优化、前端优化
7. **AI集成**：双知识库融合、智能检索、专业评审意见生成
8. **部署运维**：容器化部署、CI/CD、监控告警、备份恢复
9. **扩展性**：插件化架构、多租户支持、水平扩展能力

该设计充分考虑了律师事务所的专业需求，通过AI技术赋能，实现了开源合规评审的自动化和智能化，同时保证了系统的安全性、可靠性和可扩展性。