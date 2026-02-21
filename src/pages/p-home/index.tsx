import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

const HomePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [searchInputValue, setSearchInputValue] = useState<string>('');

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 首页';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  useEffect(() => {
    const date = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    setCurrentDate(date);
  }, []);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const searchTerm = searchInputValue.trim();
      if (searchTerm) {
        console.log('搜索:', searchTerm);
        // 实际实现中应该执行搜索功能
      }
    }
  };

  const handleNotificationClick = () => {
    console.log('打开通知面板');
    // 实际实现中应该显示通知列表
  };

  const handleQuickUploadSbom = () => {
    console.log('打开SBOM上传弹窗');
    alert('打开SBOM上传弹窗');
  };

  const handleViewAllActivities = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    console.log('查看全部活动');
    // 实际实现中可能跳转到活动列表页面或展开显示更多活动
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
                value={searchInputValue}
                onChange={e => setSearchInputValue(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm"></i>
            </div>
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center space-x-4">
            {/* 消息通知 */}
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-text-secondary hover:text-primary"
            >
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full"></span>
            </button>

            {/* 用户头像 */}
            <div className="relative">
              <Link
                to="/profile"
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50"
              >
                <img
                  src="https://s.coze.cn/image/emDcnxXFD2Q/"
                  alt="用户头像"
                  className="w-8 h-8 rounded-full"
                  data-category="人物"
                />
                <span className="text-sm text-text-primary">张律师</span>
                <i className="fas fa-chevron-down text-xs text-text-secondary"></i>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 左侧菜单 */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border-light ${styles.sidebarTransition} z-40`}
      >
        <nav className="p-4 space-y-2">
          <Link
            to="/home"
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium`}
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">欢迎回来，张律师</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
              </nav>
            </div>
            <div className="text-sm text-text-secondary">
              <i className="fas fa-calendar-alt mr-2"></i>
              <span>{currentDate}</span>
            </div>
          </div>
        </div>

        {/* 概览卡片区 */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/sbom-list?status=pending"
            className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} cursor-pointer block`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">待处理SBOM</p>
                <p className="text-3xl font-bold text-text-primary">12</p>
                <p className="text-xs text-warning mt-1">
                  <i className="fas fa-arrow-up mr-1"></i>
                  较昨日 +3
                </p>
              </div>
              <div className="w-12 h-12 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-warning text-xl"></i>
              </div>
            </div>
          </Link>

          <Link
            to="/sbom-list?status=completed"
            className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} cursor-pointer block`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">已完成评审</p>
                <p className="text-3xl font-bold text-text-primary">156</p>
                <p className="text-xs text-success mt-1">
                  <i className="fas fa-arrow-up mr-1"></i>
                  较昨日 +8
                </p>
              </div>
              <div className="w-12 h-12 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-success text-xl"></i>
              </div>
            </div>
          </Link>

          <Link
            to="/kb-list"
            className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} cursor-pointer block`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">知识库文档</p>
                <p className="text-3xl font-bold text-text-primary">2,847</p>
                <p className="text-xs text-info mt-1">
                  <i className="fas fa-arrow-up mr-1"></i>
                  本月新增 23
                </p>
              </div>
              <div className="w-12 h-12 bg-info bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-book text-info text-xl"></i>
              </div>
            </div>
          </Link>

          <Link
            to="/user-manage"
            className={`bg-white rounded-xl shadow-card p-6 ${styles.cardHover} cursor-pointer block`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">活跃用户</p>
                <p className="text-3xl font-bold text-text-primary">28</p>
                <p className="text-xs text-text-secondary mt-1">
                  <i className="fas fa-minus mr-1"></i>
                  较昨日 0
                </p>
              </div>
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-primary text-xl"></i>
              </div>
            </div>
          </Link>
        </section>

        {/* 快捷入口区 */}
        <section className="bg-white rounded-xl shadow-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">快捷操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleQuickUploadSbom}
              className="flex items-center space-x-3 p-4 border border-border-light rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
            >
              <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-upload text-primary"></i>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">上传SBOM</p>
                <p className="text-xs text-text-secondary">提交新的SBOM文件</p>
              </div>
            </button>

            <Link
              to="/kb-list"
              className="flex items-center space-x-3 p-4 border border-border-light rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
            >
              <div className="w-10 h-10 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-plus text-success"></i>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">新建知识库</p>
                <p className="text-xs text-text-secondary">创建新的知识库</p>
              </div>
            </Link>

            <Link
              to="/report-list"
              className="flex items-center space-x-3 p-4 border border-border-light rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
            >
              <div className="w-10 h-10 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-pdf text-warning"></i>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">生成报告</p>
                <p className="text-xs text-text-secondary">创建评审报告</p>
              </div>
            </Link>

            <Link
              to="/report-list"
              className="flex items-center space-x-3 p-4 border border-border-light rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
            >
              <div className="w-10 h-10 bg-info bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-bar text-info"></i>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">查看报告</p>
                <p className="text-xs text-text-secondary">浏览历史报告</p>
              </div>
            </Link>
          </div>
        </section>

        {/* 最近活动区 */}
        <section className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">最近活动</h3>
            <a
              href="#"
              onClick={handleViewAllActivities}
              className="text-sm text-primary hover:text-blue-700"
            >
              查看全部
            </a>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-success bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fas fa-check text-success text-xs"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-primary">
                  完成了SBOM文件&apos;project-x-v2.1.spdx&apos;的合规评审
                </p>
                <p className="text-xs text-text-secondary mt-1">2小时前</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fas fa-upload text-primary text-xs"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-primary">上传了新的SBOM文件&apos;mobile-app-v1.5.cdx&apos;</p>
                <p className="text-xs text-text-secondary mt-1">4小时前</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-info bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fas fa-book text-info text-xs"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-primary">
                  向法律知识库添加了新文档&apos;开源许可证指南v2.0.pdf&apos;
                </p>
                <p className="text-xs text-text-secondary mt-1">1天前</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-warning bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fas fa-file-pdf text-warning text-xs"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-primary">
                  生成了评审报告&apos;电商平台合规评审报告.pdf&apos;
                </p>
                <p className="text-xs text-text-secondary mt-1">2天前</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
