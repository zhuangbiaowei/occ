

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';

interface SBOMItem {
  id: string;
  name: string;
  uploader: string;
  uploadTime: string;
  status: 'uploaded' | 'parsed' | 'reviewing' | 'completed';
  version: string;
}

const statusMap = {
  'uploaded': { text: '已上传', class: styles.statusUploaded },
  'parsed': { text: '已解析', class: styles.statusParsed },
  'reviewing': { text: '评审中', class: styles.statusReviewing },
  'completed': { text: '已完成', class: styles.statusCompleted }
};

const mockSBOMData: SBOMItem[] = [
  {
    id: 'sbom-001',
    name: 'ecommerce-platform-v2.1.spdx',
    uploader: '张律师',
    uploadTime: '2024-01-15 14:30:25',
    status: 'completed',
    version: '2.1'
  },
  {
    id: 'sbom-002',
    name: 'mobile-app-v1.5.cdx',
    uploader: '李律师',
    uploadTime: '2024-01-15 10:15:42',
    status: 'reviewing',
    version: '1.5'
  },
  {
    id: 'sbom-003',
    name: 'api-gateway-v3.0.swid',
    uploader: '王律师',
    uploadTime: '2024-01-14 16:22:18',
    status: 'parsed',
    version: '3.0'
  },
  {
    id: 'sbom-004',
    name: 'desktop-app-v4.2.spdx',
    uploader: '张律师',
    uploadTime: '2024-01-14 09:45:33',
    status: 'uploaded',
    version: '4.2'
  },
  {
    id: 'sbom-005',
    name: 'iot-device-v1.0.cdx',
    uploader: '刘律师',
    uploadTime: '2024-01-13 15:12:07',
    status: 'completed',
    version: '1.0'
  },
  {
    id: 'sbom-006',
    name: 'cloud-service-v2.5.swid',
    uploader: '陈律师',
    uploadTime: '2024-01-13 11:30:55',
    status: 'reviewing',
    version: '2.5'
  },
  {
    id: 'sbom-007',
    name: 'database-service-v1.8.spdx',
    uploader: '张律师',
    uploadTime: '2024-01-12 14:20:19',
    status: 'parsed',
    version: '1.8'
  },
  {
    id: 'sbom-008',
    name: 'security-module-v2.3.cdx',
    uploader: '李律师',
    uploadTime: '2024-01-12 09:15:32',
    status: 'uploaded',
    version: '2.3'
  },
  {
    id: 'sbom-009',
    name: 'microservice-core-v3.2.swid',
    uploader: '王律师',
    uploadTime: '2024-01-11 16:45:28',
    status: 'completed',
    version: '3.2'
  },
  {
    id: 'sbom-010',
    name: 'frontend-framework-v2.0.spdx',
    uploader: '刘律师',
    uploadTime: '2024-01-11 10:30:15',
    status: 'reviewing',
    version: '2.0'
  },
  {
    id: 'sbom-011',
    name: 'backend-api-v4.1.cdx',
    uploader: '陈律师',
    uploadTime: '2024-01-10 15:22:44',
    status: 'parsed',
    version: '4.1'
  },
  {
    id: 'sbom-012',
    name: 'devops-tools-v1.6.swid',
    uploader: '张律师',
    uploadTime: '2024-01-10 09:18:37',
    status: 'uploaded',
    version: '1.6'
  },
  {
    id: 'sbom-013',
    name: 'analytics-platform-v2.8.spdx',
    uploader: '李律师',
    uploadTime: '2024-01-09 14:55:22',
    status: 'completed',
    version: '2.8'
  },
  {
    id: 'sbom-014',
    name: 'notification-service-v1.3.cdx',
    uploader: '王律师',
    uploadTime: '2024-01-09 11:25:14',
    status: 'reviewing',
    version: '1.3'
  },
  {
    id: 'sbom-015',
    name: 'authentication-system-v3.5.swid',
    uploader: '刘律师',
    uploadTime: '2024-01-08 16:30:48',
    status: 'parsed',
    version: '3.5'
  },
  {
    id: 'sbom-016',
    name: 'logging-service-v1.2.spdx',
    uploader: '陈律师',
    uploadTime: '2024-01-08 09:45:19',
    status: 'uploaded',
    version: '1.2'
  },
  {
    id: 'sbom-017',
    name: 'cache-service-v2.4.cdx',
    uploader: '张律师',
    uploadTime: '2024-01-07 15:12:33',
    status: 'completed',
    version: '2.4'
  },
  {
    id: 'sbom-018',
    name: 'messaging-queue-v1.7.swid',
    uploader: '李律师',
    uploadTime: '2024-01-07 10:20:56',
    status: 'reviewing',
    version: '1.7'
  },
  {
    id: 'sbom-019',
    name: 'search-engine-v2.6.spdx',
    uploader: '王律师',
    uploadTime: '2024-01-06 14:35:27',
    status: 'parsed',
    version: '2.6'
  },
  {
    id: 'sbom-020',
    name: 'storage-service-v1.4.cdx',
    uploader: '刘律师',
    uploadTime: '2024-01-06 09:50:11',
    status: 'uploaded',
    version: '1.4'
  },
  {
    id: 'sbom-021',
    name: 'monitoring-system-v3.1.swid',
    uploader: '陈律师',
    uploadTime: '2024-01-05 15:45:38',
    status: 'completed',
    version: '3.1'
  },
  {
    id: 'sbom-022',
    name: 'load-balancer-v2.2.spdx',
    uploader: '张律师',
    uploadTime: '2024-01-05 11:15:24',
    status: 'reviewing',
    version: '2.2'
  },
  {
    id: 'sbom-023',
    name: 'container-orchestration-v1.9.cdx',
    uploader: '李律师',
    uploadTime: '2024-01-04 14:25:49',
    status: 'parsed',
    version: '1.9'
  },
  {
    id: 'sbom-024',
    name: 'serverless-functions-v1.1.swid',
    uploader: '王律师',
    uploadTime: '2024-01-04 09:30:12',
    status: 'uploaded',
    version: '1.1'
  }
];

export default function SBOMListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 状态管理
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filteredData, setFilteredData] = useState<SBOMItem[]>([...mockSBOMData]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sbomSearch, setSbomSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - SBOM管理';
    return () => { document.title = originalTitle; };
  }, []);

  // 初始化页面状态
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
      applyFilters(statusParam, '', '');
    }
  }, [searchParams]);

  // 筛选逻辑
  const applyFilters = (status: string = statusFilter, time: string = timeFilter, search: string = sbomSearch) => {
    let filtered = mockSBOMData.filter(item => {
      // 搜索筛选
      const matchesSearch = !search || 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.uploader.toLowerCase().includes(search.toLowerCase());

      // 状态筛选
      const matchesStatus = !status || item.status === status;

      // 时间筛选
      const matchesTime = !time || checkTimeFilter(item.uploadTime, time);

      return matchesSearch && matchesStatus && matchesTime;
    });

    // 应用排序
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField as keyof SBOMItem];
        let bValue = b[sortField as keyof SBOMItem];

        if (sortField === 'uploadTime') {
          aValue = new Date(a.uploadTime).getTime() as any;
          bValue = new Date(b.uploadTime).getTime() as any;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const checkTimeFilter = (timestamp: string, filter: string) => {
    const itemDate = new Date(timestamp);
    const now = new Date();

    switch (filter) {
      case 'today':
        return itemDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return itemDate >= monthAgo;
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return itemDate >= quarterAgo;
      default:
        return true;
    }
  };

  // 处理搜索输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSbomSearch(value);
    applyFilters(statusFilter, timeFilter, value);
  };

  // 处理状态筛选
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value);
    applyFilters(value, timeFilter, sbomSearch);
  };

  // 处理时间筛选
  const handleTimeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTimeFilter(value);
    applyFilters(statusFilter, value, sbomSearch);
  };

  // 处理每页显示数量
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setPageSize(value);
    setCurrentPage(1);
  };

  // 处理排序
  const handleSort = (field: keyof SBOMItem) => {
    const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);
    applyFilters();
  };

  // 处理全选
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const currentPageData = getCurrentPageData();
    
    if (isChecked) {
      const newSelected = new Set(selectedItems);
      currentPageData.forEach(item => newSelected.add(item.id));
      setSelectedItems(newSelected);
    } else {
      const newSelected = new Set(selectedItems);
      currentPageData.forEach(item => newSelected.delete(item.id));
      setSelectedItems(newSelected);
    }
  };

  // 处理单项选择
  const handleItemSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  // 获取当前页数据
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  // 检查是否全选
  const isAllSelected = () => {
    const currentPageData = getCurrentPageData();
    return currentPageData.length > 0 && currentPageData.every(item => selectedItems.has(item.id));
  };

  // 检查是否部分选中
  const isIndeterminate = () => {
    const currentPageData = getCurrentPageData();
    const selectedCount = currentPageData.filter(item => selectedItems.has(item.id)).length;
    return selectedCount > 0 && selectedCount < currentPageData.length;
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedItems.size > 0) {
      if (confirm(`确定要删除选中的 ${selectedItems.size} 个SBOM文件吗？`)) {
        console.log('批量删除SBOM文件:', Array.from(selectedItems));
        // 实际应用中这里会调用删除API
      }
    }
  };

  // 处理批量评审
  const handleBatchReview = () => {
    if (selectedItems.size > 0) {
      console.log('批量开始评审:', Array.from(selectedItems));
      // 实际应用中这里会调用评审API
    }
  };

  // 处理上传SBOM
  const handleUploadSBOM = () => {
    console.log('打开SBOM上传弹窗');
    // 实际应用中这里会打开P-SBOM_UPLOAD弹窗
  };

  // 处理查看详情
  const handleViewDetail = (sbomId: string) => {
    navigate(`/sbom-detail?sbomId=${sbomId}`);
  };

  // 处理评审
  const handleReview = (sbomId: string) => {
    navigate(`/review-result?sbomId=${sbomId}`);
  };

  // 处理删除
  const handleDelete = (sbomId: string) => {
    if (confirm('确定要删除这个SBOM文件吗？')) {
      console.log('删除SBOM文件:', sbomId);
      // 实际应用中这里会调用删除API
    }
  };

  // 生成页码
  const generatePageNumbers = () => {
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const currentPageData = getCurrentPageData();
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

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
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full"></span>
            </button>
            
            {/* 用户头像 */}
            <div className="relative">
              <Link to="/profile" className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50">
                <img 
                  src="https://s.coze.cn/image/jA92kZbUzMs/" 
                  alt="用户头像" 
                  className="w-8 h-8 rounded-full" 
                />
                <span className="text-sm text-text-primary">张律师</span>
                <i className="fas fa-chevron-down text-xs text-text-secondary"></i>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 左侧菜单 */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border-light z-40 ${styles.sidebarTransition}`}>
        <nav className="p-4 space-y-2">
          <Link to="/home" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}>
            <i className="fas fa-home text-lg"></i>
            <span>首页</span>
          </Link>
          <Link to="/sbom-list" className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium`}>
            <i className="fas fa-file-alt text-lg"></i>
            <span>SBOM管理</span>
          </Link>
          <Link to="/kb-list" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}>
            <i className="fas fa-book text-lg"></i>
            <span>知识库管理</span>
          </Link>
          <Link to="/report-list" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}>
            <i className="fas fa-chart-line text-lg"></i>
            <span>报告列表</span>
          </Link>
          <Link to="/user-manage" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}>
            <i className="fas fa-users text-lg"></i>
            <span>用户管理</span>
          </Link>
          <Link to="/sys-settings" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}>
            <i className="fas fa-cog text-lg"></i>
            <span>系统设置</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">SBOM管理</h2>
              <nav className="text-sm text-text-secondary">
                <span>SBOM管理</span>
              </nav>
            </div>
            <button 
              onClick={handleUploadSBOM}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-upload mr-2"></i>
              上传SBOM
            </button>
          </div>
        </div>

        {/* 工具栏区域 */}
        <div className="bg-white rounded-xl shadow-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* 搜索和筛选 */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* 搜索框 */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜索文件名、上传人..." 
                  value={sbomSearch}
                  onChange={handleSearchChange}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm"></i>
              </div>

              {/* 状态筛选 */}
              <select 
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">全部状态</option>
                <option value="uploaded">已上传</option>
                <option value="parsed">已解析</option>
                <option value="reviewing">评审中</option>
                <option value="completed">已完成</option>
              </select>

              {/* 时间范围筛选 */}
              <select 
                value={timeFilter}
                onChange={handleTimeFilterChange}
                className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">全部时间</option>
                <option value="today">今天</option>
                <option value="week">最近一周</option>
                <option value="month">最近一月</option>
                <option value="quarter">最近三月</option>
              </select>
            </div>

            {/* 批量操作 */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleBatchDelete}
                disabled={selectedItems.size === 0}
                className="px-4 py-2 border border-danger text-danger rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-trash mr-2"></i>
                批量删除
              </button>
              <button 
                onClick={handleBatchReview}
                disabled={selectedItems.size === 0}
                className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-play mr-2"></i>
                批量评审
              </button>
            </div>
          </div>
        </div>

        {/* 内容展示区域 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {/* 表格头部 */}
          <div className="px-6 py-4 border-b border-border-light">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">共 <span>{totalItems}</span> 个SBOM文件</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">每页显示</span>
                <select 
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-2 py-1 border border-border-light rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>

          {/* 表格内容 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected()}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate();
                      }}
                      onChange={handleSelectAll}
                      className="rounded border-border-light focus:ring-primary"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('name')}
                  >
                    文件名称
                    <i className={`fas ${sortField === 'name' ? (sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'} ml-1`}></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('uploader')}
                  >
                    上传人
                    <i className={`fas ${sortField === 'uploader' ? (sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'} ml-1`}></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('uploadTime')}
                  >
                    上传时间
                    <i className={`fas ${sortField === 'uploadTime' ? (sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'} ml-1`}></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('status')}
                  >
                    状态
                    <i className={`fas ${sortField === 'status' ? (sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'} ml-1`}></i>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    版本
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {currentPageData.map((item) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                        className="rounded border-border-light focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewDetail(item.id)}
                        className="text-primary hover:text-blue-700 font-medium"
                      >
                        {item.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {item.uploader}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {item.uploadTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${styles.statusBadge} ${statusMap[item.status].class}`}>
                        {statusMap[item.status].text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {item.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleViewDetail(item.id)}
                        className="text-primary hover:text-blue-700"
                      >
                        <i className="fas fa-eye mr-1"></i>查看
                      </button>
                      {item.status !== 'completed' && (
                        <button 
                          onClick={() => handleReview(item.id)}
                          className="text-success hover:text-green-700"
                        >
                          <i className="fas fa-play mr-1"></i>评审
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-danger hover:text-red-700"
                      >
                        <i className="fas fa-trash mr-1"></i>删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页区域 */}
          <div className="px-6 py-4 border-t border-border-light">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                显示第 <span>{totalItems > 0 ? startIndex : 0}</span> - <span>{endIndex}</span> 条，共 <span>{totalItems}</span> 条
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-border-light rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="flex space-x-1">
                  {generatePageNumbers().map((page) => (
                    <button 
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded text-sm ${
                        page === currentPage 
                          ? 'bg-primary text-white border-primary' 
                          : 'border-border-light hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-border-light rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

