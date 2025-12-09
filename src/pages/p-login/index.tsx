

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const usernameInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 登录';
    return () => { document.title = originalTitle; };
  }, []);

  // 自动聚焦到用户名输入框
  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  // 密码显示/隐藏切换
  const handleTogglePassword = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // 表单输入处理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // 输入时隐藏错误信息
    if (showErrorMessage) {
      setShowErrorMessage(false);
    }
  };

  // 显示错误信息
  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    
    // 3秒后自动隐藏错误信息
    setTimeout(() => {
      setShowErrorMessage(false);
    }, 3000);
  };

  // 表单提交处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { username, password } = formData;
    
    // 基本验证
    if (!username.trim() || !password.trim()) {
      showError('请填写完整的登录信息');
      return;
    }
    
    // 显示加载状态
    setIsLoading(true);
    setShowErrorMessage(false);
    
    // 模拟登录请求
    setTimeout(() => {
      // 这里应该是实际的登录API调用
      // 由于是demo项目，我们跳过实际的验证逻辑
      console.log('登录请求:', { username, password });
      
      // 模拟登录成功，跳转到首页
      navigate('/home');
    }, 1500);
  };

  // 键盘导航支持
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target !== document.querySelector('button')) {
      const activeElement = document.activeElement;
      if (activeElement === usernameInputRef.current) {
        const passwordInput = document.querySelector('#password') as HTMLInputElement;
        if (passwordInput) {
          passwordInput.focus();
        }
      } else if (activeElement === document.querySelector('#password')) {
        handleSubmit(e as any);
      }
    }
  };

  // 忘记密码链接点击
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('跳转到忘记密码页面');
    // 这里应该跳转到忘记密码页面，但PRD中没有定义该页面
    showError('忘记密码功能暂未开放，请联系管理员');
  };

  return (
    <div className={styles.pageWrapper} onKeyDown={handleKeyDown}>
      {/* 登录容器 */}
      <div className={`w-full max-w-md ${styles.fadeIn}`}>
        {/* Logo和产品名称 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-card">
            <i className="fas fa-balance-scale text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">开源合规智能助手</h1>
          <p className="text-text-secondary text-sm">AI驱动的开源合规评审平台</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl shadow-login-card p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">欢迎登录</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名/邮箱输入框 */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-text-primary">
                用户名/邮箱
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  id="username" 
                  name="username" 
                  ref={usernameInputRef}
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus} transition-all duration-200`}
                  placeholder="请输入用户名或邮箱"
                  required
                />
                <i className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
              </div>
            </div>

            {/* 密码输入框 */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                密码
              </label>
              <div className="relative">
                <input 
                  type={isPasswordVisible ? 'text' : 'password'}
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-11 py-3 border border-border-light rounded-lg ${styles.formInputFocus} transition-all duration-200`}
                  placeholder="请输入密码"
                  required
                />
                <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary"></i>
                <button 
                  type="button" 
                  onClick={handleTogglePassword}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                >
                  <i className={`fas ${isPasswordVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* 记住密码和忘记密码 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary"
                />
                <span className="text-sm text-text-secondary">记住密码</span>
              </label>
              <a 
                href="#" 
                onClick={handleForgotPassword}
                className={`text-sm text-primary ${styles.linkHover} transition-colors`}
              >
                忘记密码？
              </a>
            </div>

            {/* 登录按钮 */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full bg-primary text-white py-3 px-4 rounded-lg font-medium ${styles.btnPrimaryHover} ${styles.btnPrimaryActive} transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-20`}
            >
              <span>{isLoading ? '登录中...' : '登录'}</span>
              {isLoading && <i className="fas fa-spinner fa-spin ml-2"></i>}
            </button>

            {/* 错误提示 */}
            {showErrorMessage && (
              <div className="bg-danger bg-opacity-10 border border-danger border-opacity-20 text-danger px-4 py-3 rounded-lg text-sm">
                <i className="fas fa-exclamation-circle mr-2"></i>
                <span>{errorMessage}</span>
              </div>
            )}
          </form>

          {/* 注册链接 */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              还没有账号？
              <Link 
                to="/register" 
                className={`text-primary font-medium ${styles.linkHover} transition-colors ml-1`}
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-8 text-text-secondary text-xs">
          <p>{'© 2024 开源合规智能助手. 保留所有权利.'}</p>
        </div>
      </div>
    </div>
  );
}

