# 前端 API 调用问题修复报告

## 问题概述
前端页面无法正确调用后端 API 进行用户注册和登录。

## 已完成的修复

### ✅ 修复 1: 前端 API 基础 URL 配置
**问题**: API 调用使用相对路径 `/api/v1/auth/login`，导致请求发送到前端服务器端口（5173/5174）而非后端（3000）。

**解决方案**: 
1. 创建前端环境配置文件: `/mnt/d/code/OpenCompliance Counsel/.env`
2. 添加 API 基础 URL 配置:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

**修改文件**: `/mnt/d/code/OpenCompliance Counsel/src/lib/auth.tsx`
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const authApi = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      // ...
    });
  },
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      // ...
    });
  },
};
```

### ✅ 修复 2: 后端 JWT 配置
**问题**: 后端缺少 JWT 密钥配置，导致 Token 生成失败。

**解决方案**:
更新 `/mnt/d/code/OpenCompliance Counsel/backend/.env`:
```
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_change_this_in_production
```

## 当前的 API 端点

### 登录 API
- **URL**: `POST http://localhost:3000/api/v1/auth/login`
- **请求体**: 
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **响应**: 
  ```json
  {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": "...",
      "email": "...",
      "username": "...",
      "fullName": "...",
      "role": "..."
    }
  }
  ```

### 注册 API
- **URL**: `POST http://localhost:3000/api/v1/auth/register`
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "fullName": "Full Name",
    "password": "password",
    "role": "lawyer"
  }
  ```
- **响应**: 用户对象（不含密码）

## 待修复的问题

### ❌ 问题 1: 后端 API 返回 500 错误
**状态**: 需要调试

**可能原因**:
- 数据库连接问题
- JWT 密钥未正确加载
- Entity 字段验证失败
- UsersService.create() 方法内部错误

**下一步**:
1. 查看后端详细错误日志
2. 检查数据库连接
3. 验证实体字段映射
4. 测试 UsersService.create() 方法

### ❌ 问题 2: 前端注册表单不完整
**状态**: 需要修改

**问题**:
1. 缺少 `fullName` 字段（后端 DTO 要求）
2. 缺少 `role` 字段（有默认值 `lawyer`）
3. `handleSubmit` 使用 `setTimeout` 模拟，未真实调用 API

**需要修改的文件**:
- `/mnt/d/code/OpenCompliance Counsel/src/pages/p-register/index.tsx`

**修改内容**:
1. 添加 fullName 输入字段
2. 更新 handleSubmit 调用 useAuth().register()
3. 传递完整的注册数据（包括 fullName 和 role）

## 测试步骤

### 测试 API 调用
```bash
# 测试登录
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'

# 测试注册
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","fullName":"Test User","password":"Test123456","role":"lawyer"}'
```

### 测试前端功能
1. 访问注册页面
2. 填写注册表单（邮箱、用户名、全名、密码）
3. 提交表单
4. 验证是否跳转到登录页
5. 使用新账户登录
6. 验证是否成功进入系统

## 配置文件

### 前端配置
- **环境文件**: `/mnt/d/code/OpenCompliance Counsel/.env`
- **API 配置**: `/mnt/d/code/OpenCompliance Counsel/src/lib/auth.tsx`
- **注册页面**: `/mnt/d/code/OpenCompliance Counsel/src/pages/p-register/index.tsx`
- **登录页面**: `/mnt/d/code/OpenCompliance Counsel/src/pages/p-login/index.tsx`

### 后端配置
- **环境文件**: `/mnt/d/code/OpenCompliance Counsel/backend/.env`
- **认证服务**: `/mnt/d/code/OpenCompliance Counsel/backend/src/auth/auth.service.ts`
- **认证控制器**: `/mnt/d/code/OpenCompliance Counsel/backend/src/auth/auth.controller.ts`
- **登录 DTO**: `/mnt/d/code/OpenCompliance Counsel/backend/src/auth/dto/login.dto.ts`
- **注册 DTO**: `/mnt/d/code/OpenCompliance Counsel/backend/src/auth/dto/register.dto.ts`

## 总结

**已修复**:
- ✅ 前端 API URL 配置
- ✅ 后端 JWT 密钥配置

**待修复**:
- ❌ 后端 500 错误（需要调试）
- ❌ 前端注册表单（需要添加字段和真实 API 调用）

**下一步行动**:
1. 调试并修复后端 500 错误
2. 更新前端注册表单
3. 测试完整的注册和登录流程
