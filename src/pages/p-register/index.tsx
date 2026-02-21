import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import styles from './styles.module.css';

interface FormData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isRegistering } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 注册';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // 表单验证函数
  const validateFullName = (fullName: string): string => {
    if (fullName.length < 2) {
      return '姓名至少2个字符';
    }
    if (fullName.length > 100) {
      return '姓名不能超过100个字符';
    }
    return '';
  };

  const validateUsername = (username: string): string => {
    if (username.length < 3) {
      return '用户名至少3个字符';
    }
    if (username.length > 20) {
      return '用户名不能超过20个字符';
    }
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
      return '用户名只能包含字母、数字、下划线和中文';
    }
    return '';
  };

  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return '请输入有效的邮箱地址';
    }
    return '';
  };

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return '密码至少8位';
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      return '密码必须包含字母和数字';
    }
    return '';
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (password !== confirmPassword) {
      return '两次输入的密码不一致';
    }
    return '';
  };

  // 处理输入变化
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 处理输入框失焦验证
  const handleInputBlur = (field: keyof FormData) => {
    let error = '';
    const value = formData[field];

    switch (field) {
    case 'fullName':
      error = validateFullName(value);
      break;
    case 'username':
      error = validateUsername(value);
      break;
    case 'email':
      error = validateEmail(value);
      break;
    case 'password':
      error = validatePassword(value);
      break;
    case 'confirmPassword':
      error = validateConfirmPassword(formData.password, value);
      break;
    }

    setFormErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 清除之前的错误信息
    setFormErrors({
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    // 验证所有字段
    const fullNameError = validateFullName(formData.fullName);
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    const hasError = fullNameError || usernameError || emailError || passwordError || confirmPasswordError;

    if (hasError) {
      setFormErrors({
        fullName: fullNameError,
        username: usernameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    try {
      await register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
    } catch (error: any) {
      // 显示后端返回的具体错误信息
      const errorMessage = error?.message || '注册失败，请重试';
      setFormErrors(prev => ({
        ...prev,
        email: errorMessage,
      }));
    }
  };

  // 处理密码显示/隐藏切换
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isRegistering) {
        const form = document.getElementById('register-form') as HTMLFormElement;
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRegistering]);

  return (
    <div className={styles.pageWrapper}>
      <div className="w-full max-w-md mx-auto px-4 py-8">
        {/* Logo和产品名称 */}
        <div className={`text-center mb-8 ${styles.fadeIn}`}>
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-balance-scale text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">开源合规智能助手</h1>
          <p className="text-text-secondary">智能合规评审平台</p>
        </div>

        {/* 注册表单 */}
        <div className={`bg-white rounded-xl shadow-card p-8 ${styles.fadeIn}`}>
          <h2 className="text-xl font-semibold text-text-primary text-center mb-6">创建账户</h2>

          <form id="register-form" className="space-y-6" onSubmit={handleSubmit}>
            {/* 姓名 */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-text-primary">
                姓名 *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className={`w-full px-4 py-3 border rounded-lg transition-all ${styles.formInputFocus} ${
                  formErrors.fullName ? 'border-danger' : 'border-border-light'
                }`}
                placeholder="请输入姓名"
                value={formData.fullName}
                onChange={e => handleInputChange('fullName', e.target.value)}
                onBlur={() => handleInputBlur('fullName')}
                required
              />
              {formErrors.fullName && (
                <div className={styles.errorMessage}>{formErrors.fullName}</div>
              )}
            </div>

            {/* 用户名 */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-text-primary">
                用户名 *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className={`w-full px-4 py-3 border rounded-lg transition-all ${styles.formInputFocus} ${
                  formErrors.username ? 'border-danger' : 'border-border-light'
                }`}
                placeholder="请输入用户名"
                value={formData.username}
                onChange={e => handleInputChange('username', e.target.value)}
                onBlur={() => handleInputBlur('username')}
                required
              />
              {formErrors.username && (
                <div className={styles.errorMessage}>{formErrors.username}</div>
              )}
            </div>

            {/* 邮箱 */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                邮箱地址 *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full px-4 py-3 border rounded-lg transition-all ${styles.formInputFocus} ${
                  formErrors.email ? 'border-danger' : 'border-border-light'
                }`}
                placeholder="请输入邮箱地址"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                onBlur={() => handleInputBlur('email')}
                required
              />
              {formErrors.email && <div className={styles.errorMessage}>{formErrors.email}</div>}
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                密码 *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg transition-all ${styles.formInputFocus} ${
                    formErrors.password ? 'border-danger' : 'border-border-light'
                  }`}
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  onBlur={() => handleInputBlur('password')}
                  required
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {formErrors.password && (
                <div className={styles.errorMessage}>{formErrors.password}</div>
              )}
              <div className="text-xs text-text-secondary">密码至少8位，包含字母和数字</div>
            </div>

            {/* 确认密码 */}
            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-text-primary"
              >
                确认密码 *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  name="confirm-password"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg transition-all ${styles.formInputFocus} ${
                    formErrors.confirmPassword ? 'border-danger' : 'border-border-light'
                  }`}
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleInputBlur('confirmPassword')}
                  required
                />
                <button
                  type="button"
                  onClick={handleToggleConfirmPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {formErrors.confirmPassword && (
                <div className={styles.errorMessage}>{formErrors.confirmPassword}</div>
              )}
            </div>

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={isRegistering}
              className={`w-full py-3 px-4 rounded-lg font-medium ${styles.btnPrimary}`}
            >
              <span>{isRegistering ? '注册中...' : '注册'}</span>
              {isRegistering && <i className="fas fa-spinner fa-spin ml-2"></i>}
            </button>
          </form>

          {/* 登录链接 */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              已有账户？
              <Link
                to="/login"
                className="text-primary hover:text-blue-700 font-medium transition-colors ml-1"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>

        {/* 页脚 */}
        <div className="text-center mt-8 text-text-secondary text-sm">
          <p>&copy; 2024 开源合规智能助手. 保留所有权利.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
