# 前端 API 调用修复总结

## 已完成的修复

### 1. 创建前端环境配置文件 ✅
- **文件**: `/mnt/d/code/OpenCompliance Counsel/.env`
- **内容**:
  ```
  VITE_API_BASE_URL=http://localhost:3000
  VITE_APP_TITLE=开源合规智能助手
  ```

### 2. 更新 auth.tsx API 调用 ✅
- **文件**: `/mnt/d/code/OpenCompliance Counsel/src/lib/auth.tsx`
- **改动**:
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

### 3. 后端配置更新 ✅
- **文件**: `/mnt/d/code/OpenCompliance Counsel/backend/.env`
- **新增 JWT 配置**:
  ```
  JWT_SECRET=your_jwt_secret_key_change_this_in_production
  JWT_REFRESH_SECRET=your_jwt_refresh_secret_change_this_in_production
  ```

## 存在的问题

### 后端 API 问题 ⚠️
- 注册和登录接口返回 500 错误
- 需要检查后端日志确定具体错误原因
- 可能的问题:
  - 数据库连接问题
  - JWT 配置未正确加载
  - 用户服务中的验证逻辑错误
  - 实体字段不匹配

### 前端注册表单问题 ⚠️
- 注册表单缺少 `fullName` 字段（后端要求）
- 注册表单缺少 `role` 字段（后端要求，有默认值）
- 注册提交处理使用 `setTimeout` 模拟，未真正调用 API

## 前端 API 调用地址

### 登录
- **URL**: `POST http://localhost:3000/api/v1/auth/login`
- **请求体**: `{ email: string, password: string }`
- **响应**: `{ accessToken, refreshToken, user }`

### 注册
- **URL**: `POST http://localhost:3000/api/v1/auth/register`
- **请求体**: `{ email, username, fullName, password, role }`
- **响应**: 用户数据（不含密码）

## 需要修复的内容

### 1. 修复后端 500 错误
需要检查:
- 后端日志输出
- 数据库连接是否正常
- JWT 配置是否正确加载
- UsersService 中的 create 方法

### 2. 更新前端注册表单
需要添加:
- fullName 输入字段
- 更新 handleSubmit 调用真实 API
- 添加表单验证

### 3. 测试 API 调用
测试场景:
- 用户注册成功
- 用户注册失败（重复邮箱）
- 用户登录成功
- 用户登录失败（错误密码）

## 下一步行动

1. **调试后端**: 查看详细错误日志
2. **修复后端错误**: 根据日志修复问题
3. **更新前端注册表单**: 添加缺失字段
4. **测试完整流程**: 注册 → 登录 → 访问受保护页面
