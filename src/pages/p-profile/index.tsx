import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../lib/auth';

interface ProfileFormData {
  username: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  avatar?: string;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 个人资料';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // 个人信息表单状态
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    username: user?.username || '',
    email: user?.email || '',
    phone: '',
    department: '',
    position: '',
    avatar: 'https://s.coze.cn/image/VpvA04RECrM/',
  });

  // 当用户信息加载时更新表单
  useEffect(() => {
    if (user) {
      setProfileFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // 密码表单状态
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 密码显示状态
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 消息状态
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // 头像上传区域显示状态
  const [showAvatarUploadArea] = useState(false);

  // 显示提示消息
  const showMessage = (type: 'success' | 'error', text: string) => {
    // 隐藏所有消息
    setShowSuccessMessage(false);
    setShowErrorMessage(false);

    // 显示对应类型的消息
    if (type === 'success') {
      setSuccessMessage(text);
      setShowSuccessMessage(true);
    } else if (type === 'error') {
      setErrorMessage(text);
      setShowErrorMessage(true);
    }

    // 3秒后自动隐藏消息
    setTimeout(() => {
      if (type === 'success') {
        setShowSuccessMessage(false);
      } else if (type === 'error') {
        setShowErrorMessage(false);
      }
    }, 3000);
  };

  // 处理退出登录
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 处理个人信息表单输入变化
  const handleProfileInputChange = (field: keyof ProfileFormData, value: string) => {
    setProfileFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 处理密码表单输入变化
  const handlePasswordInputChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 个人信息表单提交
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 简单验证
    if (!profileFormData.username || !profileFormData.email) {
      showMessage('error', '用户名和邮箱为必填项！');
      return;
    }

    // 模拟API调用
    setTimeout(() => {
      showMessage('success', '个人信息更新成功！');
      console.log('个人信息更新成功', profileFormData);
    }, 500);
  };

  // 密码修改表单提交
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证
    if (
      !passwordFormData.oldPassword ||
      !passwordFormData.newPassword ||
      !passwordFormData.confirmPassword
    ) {
      showMessage('error', '请填写完整的密码信息！');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      showMessage('error', '两次输入的新密码不一致！');
      return;
    }

    if (passwordFormData.newPassword.length < 8) {
      showMessage('error', '新密码长度至少8位！');
      return;
    }

    // 模拟API调用
    setTimeout(() => {
      // 重置表单
      setPasswordFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      showMessage('success', '密码修改成功！');
      console.log('密码修改成功');
    }, 500);
  };

  // 头像上传功能
  const handleChangeAvatar = () => {
    console.log('需要调用第三方接口实现头像上传功能');
    // 注释：此功能需要文件上传API，在原型阶段仅做UI展示
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-border-light h-16 z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo和产品名称 */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-balance-scale text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-semibold text-text-primary">开源合规智能助手</h1>
          </div>

          {/* 全局搜索框 */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索知识库、SBOM文件..."
                className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm"></i>
            </div>
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center space-x-4">
            {/* 消息通知 */}
            <button className="relative p-2 text-text-secondary hover:text-primary">
              <i className="fas fa-bell text-lg"></i>
              {user && <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full"></span>}
            </button>

            {/* 用户头像 */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50"
                onClick={handleLogout}
                title="点击退出登录"
              >
                <img
                  src={profileFormData.avatar}
                  alt="用户头像"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-text-primary">{user?.username || '未登录'}</span>
                <i className="fas fa-chevron-down text-xs text-text-secondary"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 左侧菜单 */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border-light z-40 ${styles.sidebarTransition}`}
      >
        <nav className="p-4 space-y-2">
          <Link
            to="/home"
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}
          >
            <i className="fas fa-home text-lg"></i>
            <span>首页</span>
          </Link>
          <Link
            to="/sbom-list"
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}
          >
            <i className="fas fa-file-alt text-lg"></i>
            <span>SBOM管理</span>
          </Link>
          <Link
            to="/kb-list"
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}
          >
            <i className="fas fa-book text-lg"></i>
            <span>知识库管理</span>
          </Link>
          <Link
            to="/report-list"
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}
          >
            <i className="fas fa-chart-line text-lg"></i>
            <span>报告列表</span>
          </Link>
          <Link
            to="/user-manage"
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}
          >
            <i className="fas fa-users text-lg"></i>
            <span>用户管理</span>
          </Link>
          <Link
            to="/sys-settings"
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}
          >
            <i className="fas fa-cog text-lg"></i>
            <span>系统设置</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">个人资料</h2>
              <nav className="text-sm text-text-secondary">
                <span>个人资料</span>
              </nav>
            </div>
          </div>
        </div>

        {/* 成功提示消息 */}
        {showSuccessMessage && (
          <div
            className={`bg-success bg-opacity-10 border border-success border-opacity-20 text-success px-4 py-3 rounded-lg mb-6 ${styles.successMessage}`}
          >
            <div className="flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* 错误提示消息 */}
        {showErrorMessage && (
          <div
            className={`bg-danger bg-opacity-10 border border-danger border-opacity-20 text-danger px-4 py-3 rounded-lg mb-6 ${styles.successMessage}`}
          >
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* 个人信息表单 */}
        <section className="bg-white rounded-xl shadow-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-6">基本信息</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* 头像上传区域 */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-text-primary">头像</label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={profileFormData.avatar}
                    alt="当前头像"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleChangeAvatar}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-700"
                  >
                    <i className="fas fa-camera"></i>
                  </button>
                </div>
                {showAvatarUploadArea && (
                  <div
                    className={`${styles.avatarUploadArea} flex-1 max-w-md h-32 rounded-lg flex flex-col items-center justify-center cursor-pointer`}
                  >
                    <i className="fas fa-cloud-upload-alt text-3xl text-text-secondary mb-2"></i>
                    <p className="text-sm text-text-secondary">点击或拖拽上传头像</p>
                    <p className="text-xs text-text-secondary mt-1">支持 JPG、PNG 格式，最大 2MB</p>
                  </div>
                )}
              </div>
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
                className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                value={profileFormData.username}
                onChange={e => handleProfileInputChange('username', e.target.value)}
                required
              />
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
                className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                value={profileFormData.email}
                onChange={e => handleProfileInputChange('email', e.target.value)}
                required
              />
            </div>

            {/* 手机号码 */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-text-primary">
                手机号码
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                value={profileFormData.phone}
                onChange={e => handleProfileInputChange('phone', e.target.value)}
              />
            </div>

            {/* 部门 */}
            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-medium text-text-primary">
                所属部门
              </label>
              <input
                type="text"
                id="department"
                name="department"
                className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                value={profileFormData.department}
                onChange={e => handleProfileInputChange('department', e.target.value)}
              />
            </div>

            {/* 职位 */}
            <div className="space-y-2">
              <label htmlFor="position" className="block text-sm font-medium text-text-primary">
                职位
              </label>
              <input
                type="text"
                id="position"
                name="position"
                className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                value={profileFormData.position}
                onChange={e => handleProfileInputChange('position', e.target.value)}
              />
            </div>

            {/* 保存按钮 */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                <i className="fas fa-save mr-2"></i>
                保存修改
              </button>
            </div>
          </form>
        </section>

        {/* 密码修改表单 */}
        <section className="bg-white rounded-xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">修改密码</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* 旧密码 */}
            <div className="space-y-2">
              <label htmlFor="old-password" className="block text-sm font-medium text-text-primary">
                当前密码 *
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  id="old-password"
                  name="old-password"
                  className={`w-full px-4 py-2 pr-10 border border-border-light rounded-lg ${styles.formInputFocus}`}
                  placeholder="请输入当前密码"
                  value={passwordFormData.oldPassword}
                  onChange={e => handlePasswordInputChange('oldPassword', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary"
                >
                  <i className={`fas ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* 新密码 */}
            <div className="space-y-2">
              <label htmlFor="new-password" className="block text-sm font-medium text-text-primary">
                新密码 *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="new-password"
                  name="new-password"
                  className={`w-full px-4 py-2 pr-10 border border-border-light rounded-lg ${styles.formInputFocus}`}
                  placeholder="请输入新密码"
                  value={passwordFormData.newPassword}
                  onChange={e => handlePasswordInputChange('newPassword', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary"
                >
                  <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <p className="text-xs text-text-secondary">密码长度至少8位，包含字母和数字</p>
            </div>

            {/* 确认新密码 */}
            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-text-primary"
              >
                确认新密码 *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  name="confirm-password"
                  className={`w-full px-4 py-2 pr-10 border border-border-light rounded-lg ${styles.formInputFocus}`}
                  placeholder="请再次输入新密码"
                  value={passwordFormData.confirmPassword}
                  onChange={e => handlePasswordInputChange('confirmPassword', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary"
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* 保存密码按钮 */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                <i className="fas fa-key mr-2"></i>
                修改密码
              </button>
            </div>
          </form>
        </section>

        {/* 安全退出 */}
        <section className="bg-white rounded-xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">安全退出</h3>
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              <p>退出当前账号，返回登录页面</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-danger text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 transition-colors"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              退出登录
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
