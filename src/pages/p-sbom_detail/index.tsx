import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';
import { SbomData, Component } from './types';

const SbomDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sbomData, setSbomData] = useState<SbomData | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);
  const [componentsSearchTerm, setComponentsSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const pageSize = 10;
  const sbomId = searchParams.get('sbomId') || 'sbom-001';

  // 模拟SBOM数据
  const mockSbomData: Record<string, SbomData> = {
    'sbom-001': {
      fileName: 'project-x-v2.1.spdx',
      uploader: '张律师',
      uploadTime: '2024年1月15日 14:30',
      status: '已解析',
      version: 'v2.1',
      format: 'SPDX 2.3',
      componentsCount: 24,
      licenseTypes: 8,
    },
    'sbom-002': {
      fileName: 'mobile-app-v1.5.cdx',
      uploader: '李律师',
      uploadTime: '2024年1月14日 16:45',
      status: '待评审',
      version: 'v1.5',
      format: 'CycloneDX 1.4',
      componentsCount: 18,
      licenseTypes: 6,
    },
  };

  // 模拟组件数据
  const mockComponents: Component[] = [
    {
      name: 'React',
      version: '18.2.0',
      license: 'MIT',
      supplier: 'Meta Platforms, Inc.',
      type: 'Library',
      description: '用于构建用户界面的JavaScript库',
    },
    {
      name: 'Vue.js',
      version: '3.4.15',
      license: 'MIT',
      supplier: 'Evan You',
      type: 'Framework',
      description: '渐进式JavaScript框架',
    },
    {
      name: 'Node.js',
      version: '20.10.0',
      license: 'MIT',
      supplier: 'Node.js Foundation',
      type: 'Runtime',
      description: 'JavaScript运行时环境',
    },
    {
      name: 'Express',
      version: '4.18.2',
      license: 'MIT',
      supplier: 'TJ Holowaychuk',
      type: 'Library',
      description: 'Node.js Web应用框架',
    },
    {
      name: 'PostgreSQL',
      version: '16.1',
      license: 'PostgreSQL',
      supplier: 'PostgreSQL Global Development Group',
      type: 'Database',
      description: '开源关系型数据库',
    },
    {
      name: 'Redis',
      version: '7.2.3',
      license: 'BSD-3-Clause',
      supplier: 'Redis Labs',
      type: 'Database',
      description: '开源内存数据存储',
    },
    {
      name: 'jQuery',
      version: '3.7.1',
      license: 'MIT',
      supplier: 'jQuery Foundation',
      type: 'Library',
      description: '快速、简洁的JavaScript库',
    },
    {
      name: 'Bootstrap',
      version: '5.3.2',
      license: 'MIT',
      supplier: 'Twitter, Inc.',
      type: 'Framework',
      description: '前端开发框架',
    },
    {
      name: 'TypeScript',
      version: '5.3.3',
      license: 'Apache-2.0',
      supplier: 'Microsoft Corporation',
      type: 'Language',
      description: 'JavaScript的超集',
    },
    {
      name: 'Docker',
      version: '24.0.7',
      license: 'Apache-2.0',
      supplier: 'Docker, Inc.',
      type: 'Tool',
      description: '容器化平台',
    },
  ];

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    const currentSbomData = mockSbomData[sbomId] || mockSbomData['sbom-001'];
    document.title = `开源合规智能助手 - ${currentSbomData.fileName}`;
    return () => {
      document.title = originalTitle;
    };
  }, [sbomId]);

  // 加载SBOM详情和组件数据
  useEffect(() => {
    const currentSbomData = mockSbomData[sbomId] || mockSbomData['sbom-001'];
    setSbomData(currentSbomData);
    setComponents(mockComponents);
    setFilteredComponents(mockComponents);
  }, [sbomId]);

  // 组件搜索过滤
  useEffect(() => {
    if (componentsSearchTerm.trim() === '') {
      setFilteredComponents(components);
    } else {
      const filtered = components.filter(
        component =>
          component.name.toLowerCase().includes(componentsSearchTerm.toLowerCase()) ||
          component.license.toLowerCase().includes(componentsSearchTerm.toLowerCase()) ||
          component.supplier.toLowerCase().includes(componentsSearchTerm.toLowerCase()) ||
          component.type.toLowerCase().includes(componentsSearchTerm.toLowerCase())
      );
      setFilteredComponents(filtered);
    }
    setCurrentPage(1); // 重置到第一页
  }, [componentsSearchTerm, components]);

  // 获取当前页的组件
  const getCurrentPageComponents = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredComponents.slice(startIndex, endIndex);
  };

  // 计算总页数
  const totalPages = Math.ceil(filteredComponents.length / pageSize);

  // 处理页码点击
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // 处理上一页
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 处理下一页
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 处理开始评审
  const handleStartReview = () => {
    navigate(`/review-result?sbomId=${sbomId}`);
  };

  // 处理下载SBOM
  const handleDownloadSbom = () => {
    console.log('下载SBOM文件功能需要后端支持');
    alert('下载功能演示');
  };

  // 处理用户头像点击
  const handleUserAvatarClick = () => {
    navigate('/profile');
  };

  // 获取状态样式类名
  const getStatusClassName = (status: SbomData['status']) => {
    const baseClass = styles.statusBadge;
    switch (status) {
    case '待评审':
      return `${baseClass} ${styles.statusPending}`;
    case '已解析':
      return `${baseClass} ${styles.statusParsed}`;
    case '评审中':
      return `${baseClass} ${styles.statusReviewing}`;
    case '已完成':
      return `${baseClass} ${styles.statusCompleted}`;
    default:
      return baseClass;
    }
  };

  if (!sbomData) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  const currentPageComponents = getCurrentPageComponents();
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, filteredComponents.length);

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
                value={globalSearchTerm}
                onChange={e => setGlobalSearchTerm(e.target.value)}
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
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full"></span>
            </button>

            {/* 用户头像 */}
            <div className="relative">
              <button
                onClick={handleUserAvatarClick}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50"
              >
                <img
                  src="https://s.coze.cn/image/ivRblp4NkTw/"
                  alt="用户头像"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-text-primary">张律师</span>
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
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium`}
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">SBOM详情</h2>
              <nav className="text-sm text-text-secondary">
                <Link to="/home" className="hover:text-primary">
                  首页
                </Link>
                <span className="mx-2">/</span>
                <Link to="/sbom-list" className="hover:text-primary">
                  SBOM管理
                </Link>
                <span className="mx-2">/</span>
                <span>{sbomData.fileName}</span>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownloadSbom}
                className="px-4 py-2 border border-border-light rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <i className="fas fa-download mr-2"></i>
                下载原始SBOM
              </button>
              <button
                onClick={handleStartReview}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-play mr-2"></i>
                开始评审
              </button>
            </div>
          </div>
        </div>

        {/* SBOM基本信息区 */}
        <section className="bg-white rounded-xl shadow-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">基本信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">文件名称</label>
              <p className="text-sm font-medium text-text-primary">{sbomData.fileName}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">上传人</label>
              <p className="text-sm font-medium text-text-primary">{sbomData.uploader}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">上传时间</label>
              <p className="text-sm font-medium text-text-primary">{sbomData.uploadTime}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">状态</label>
              <span className={getStatusClassName(sbomData.status)}>{sbomData.status}</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">版本</label>
              <p className="text-sm font-medium text-text-primary">{sbomData.version}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">格式</label>
              <p className="text-sm font-medium text-text-primary">{sbomData.format}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">组件总数</label>
              <p className="text-sm font-medium text-text-primary">{sbomData.componentsCount}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">许可证类型</label>
              <p className="text-sm font-medium text-text-primary">{sbomData.licenseTypes}种</p>
            </div>
          </div>
        </section>

        {/* 组件列表区 */}
        <section className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">组件列表</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索组件名称、许可证..."
                  value={componentsSearchTerm}
                  onChange={e => setComponentsSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm"></i>
              </div>
            </div>
          </div>

          {/* 组件表格 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    组件名称
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    版本
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    许可证
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    供应商
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    类型
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                    描述
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPageComponents.map((component, index) => (
                  <tr key={index} className={`${styles.tableRow} border-b border-border-light`}>
                    <td className="py-3 px-4">
                      <div className="font-medium text-text-primary">{component.name}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary">{component.version}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {component.license}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary">{component.supplier}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {component.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary">
                      {component.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页区域 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-text-secondary">
              显示 <span>{start}</span> 到 <span>{end}</span> 条，共{' '}
              <span>{filteredComponents.length}</span> 条记录
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-border-light rounded hover:border-primary hover:bg-blue-50 disabled:opacity-50"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageClick(index + 1)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === index + 1
                        ? 'border-primary bg-primary text-white'
                        : 'border-border-light hover:border-primary hover:bg-blue-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-border-light rounded hover:border-primary hover:bg-blue-50 disabled:opacity-50"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SbomDetailPage;
