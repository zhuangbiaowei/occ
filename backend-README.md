# 后端知识库API文档

## 概述
本知识库API提供了完整的知识库管理功能，包括知识库CRUD、文档管理、文档版本控制和标签系统。

## API端点

### 1. 知识库管理（/api/v1/knowledge-bases）

#### 获取知识库列表
- **GET** `/api/v1/knowledge-bases`
- **查询参数**:
  - `keyword` (可选): 搜索关键词
  - `status` (可选): 状态筛选
  - `page` (可选): 页码 (默认: 1)
  - `pageSize` (可选): 每页数量 (默认: 10)
- **响应**: 分页的知识库列表

#### 创建知识库
- **POST** `/api/v1/knowledge-bases`
- **请求体**:
  ```json
  {
    "name": "开源许可证知识库",
    "description": "管理所有开源许可证相关信息"
  }
  ```
- **响应**: 创建的知识库信息

#### 其他端点
- **GET** `/api/v1/knowledge-bases/:id` - 获取知识库详情
- **PUT** `/api/v1/knowledge-bases/:id` - 更新知识库
- **DELETE** `/api/v1/knowledge-bases/:id` - 删除知识库
- **GET** `/api/v1/knowledge-bases/:id/documents` - 获取知识库下的文档列表

### 2. 文档管理（/api/v1/documents）

#### 获取文档列表
- **GET** `/api/v1/documents`
- **查询参数**:
  - `keyword` (可选): 搜索关键词
  - `knowledgeBaseId` (可选): 知识库ID
  - `tagIds` (可选): 标签ID数组
  - `status` (可选): 状态筛选
  - `page` (可选): 页码 (默认: 1)
  - `pageSize` (可选): 每页数量 (默认: 10)

#### 创建文档
- **POST** `/api/v1/documents`
- **请求体**:
  ```json
  {
    "title": "GPL v3.0 许可证详解",
    "content": "GPL v3.0 是最流行的开源许可证...",
    "knowledgeBaseId": "uuid-of-knowledge-base",
    "tagIds": ["uuid-1", "uuid-2"]
  }
  ```

#### 其他端点
- **GET** `/api/v1/documents/:id` - 获取文档详情
- **PUT** `/api/v1/documents/:id` - 更新文档
- **DELETE** `/api/v1/documents/:id` - 删除文档
- **POST** `/api/v1/documents/:id/increment-read` - 增加阅读数

### 3. 标签管理（/api/v1/tags）

#### 获取标签列表
- **GET** `/api/v1/tags`

#### 创建标签
- **POST** `/api/v1/tags`
- **请求体**:
  ```json
  {
    "name": "GPL许可证",
    "color": "#1890ff",
    "sort": 0
  }
  ```

#### 其他端点
- **GET** `/api/v1/tags/:id` - 获取标签详情
- **PUT** `/api/v1/tags/:id` - 更新标签
- **DELETE** `/api/v1/tags/:id` - 删除标签

## 数据库表结构

### knowledge_bases（知识库表）
- `id`: UUID, 主键
- `name`: VARCHAR(200), 知识库名称
- `description`: TEXT, 描述
- `status`: VARCHAR(100), 状态
- `created_by`: UUID, 创建者ID
- `updated_by`: UUID, 更新者ID
- `created_at`: TIMESTAMP, 创建时间
- `updated_at`: TIMESTAMP, 更新时间

### knowledge_documents（知识文档表）
- `id`: UUID, 主键
- `title`: VARCHAR(200), 文档标题
- `content`: TEXT, 文档内容
- `file_name`: VARCHAR(100), 文件名
- `file_path`: VARCHAR(200), 文件存储路径
- `mime_type`: VARCHAR(100), MIME类型
- `file_hash`: VARCHAR(64), 文件哈希值
- `version`: INTEGER, 版本号
- `status`: VARCHAR(100), 状态
- `read_count`: INTEGER, 阅读数
- `knowledge_base_id`: UUID, 知识库ID（外键）

### document_versions（文档版本表）
- `id`: UUID, 主键
- `version`: INTEGER, 版本号
- `content`: TEXT, 文档内容
- `file_name`: VARCHAR(100), 文件名
- `file_path`: VARCHAR(200), 文件存储路径
- `change_log`: TEXT, 变更日志
- `document_id`: UUID, 文档ID（外键）

### document_tags（文档标签表）
- `id`: UUID, 主键
- `name`: VARCHAR(100), 标签名称
- `color`: VARCHAR(100), 标签颜色
- `sort`: INTEGER, 排序
- `status`: VARCHAR(100), 状态

## 已实现的功能

✅ 知识库CRUD API（GET/POST/PUT/DELETE /api/v1/knowledge-bases）
✅ 文档CRUD API
✅ 完整的文档标签系统
✅ 文档版本管理（数据库表结构和支持）
✅ JWT认证和权限控制
✅ 分页查询和筛选
✅ 关联查询（包含创建者、更新者信息）

## 待实现的功能

⌛ 文档上传和文件存储（MinIO集成）
⌛ 文档版本管理的完整业务逻辑
⌛ 文档内容解析和全文索引
⌛ 文档上传时的版本自动创建
⌛ Elasticsearch全文搜索集成
