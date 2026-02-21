import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

interface Report {
  id: string;
  name: string;
  sbom: string;
  sbomId: string;
  author: string;
  time: string;
  format: string;
}

type SortField = 'name' | 'sbom' | 'author' | 'time' | 'format';
type SortOrder = 'asc' | 'desc';
type TimeFilter = '' | 'today' | 'week' | 'month' | 'quarter';
type FormatFilter = '' | 'pdf' | 'word';

const ReportListPage: React.FC = () => {
  // 模拟报告数据
  const mockReports: Report[] = [
    {
      id: 'R001',
      name: '电商平台合规评审报告',
      sbom: 'ecommerce-platform-v2.1.spdx',
      sbomId: 'SBOM001',
      author: '张律师',
      time: '2024-01-15 14:30:25',
      format: 'PDF',
    },
    {
      id: 'R002',
      name: '移动端应用开源合规分析',
      sbom: 'mobile-app-v1.5.cdx',
      sbomId: 'SBOM002',
      author: '李律师',
      time: '2024-01-15 11:20:10',
      format: 'Word',
    },
    {
      id: 'R003',
      name: '企业级API网关合规检查',
      sbom: 'api-gateway-v3.0.spdx',
      sbomId: 'SBOM003',
      author: '王律师',
      time: '2024-01-14 16:45:30',
      format: 'PDF',
    },
    {
      id: 'R004',
      name: '金融系统开源组件审计',
      sbom: 'finance-system-v2.2.cdx',
      sbomId: 'SBOM004',
      author: '张律师',
      time: '2024-01-14 09:15:45',
      format: 'Word',
    },
    {
      id: 'R005',
      name: '医疗软件合规性评估',
      sbom: 'medical-software-v1.8.spdx',
      sbomId: 'SBOM005',
      author: '刘律师',
      time: '2024-01-13 15:20:15',
      format: 'PDF',
    },
    {
      id: 'R006',
      name: '教育平台开源许可证审查',
      sbom: 'education-platform-v2.5.cdx',
      sbomId: 'SBOM006',
      author: '李律师',
      time: '2024-01-13 10:30:50',
      format: 'Word',
    },
    {
      id: 'R007',
      name: '物联网设备固件合规分析',
      sbom: 'iot-firmware-v1.2.spdx',
      sbomId: 'SBOM007',
      author: '王律师',
      time: '2024-01-12 14:15:20',
      format: 'PDF',
    },
    {
      id: 'R008',
      name: '区块链平台开源合规检查',
      sbom: 'blockchain-platform-v1.0.cdx',
      sbomId: 'SBOM008',
      author: '张律师',
      time: '2024-01-12 09:45:10',
      format: 'Word',
    },
    {
      id: 'R009',
      name: '游戏引擎组件许可证评估',
      sbom: 'game-engine-v3.1.spdx',
      sbomId: 'SBOM009',
      author: '刘律师',
      time: '2024-01-11 16:25:35',
      format: 'PDF',
    },
    {
      id: 'R010',
      name: '云计算平台合规性报告',
      sbom: 'cloud-platform-v2.8.cdx',
      sbomId: 'SBOM010',
      author: '李律师',
      time: '2024-01-11 11:10:20',
      format: 'Word',
    },
    {
      id: 'R011',
      name: 'DevOps工具链合规审查',
      sbom: 'devops-tools-v1.9.spdx',
      sbomId: 'SBOM011',
      author: '王律师',
      time: '2024-01-10 15:30:45',
      format: 'PDF',
    },
    {
      id: 'R012',
      name: '人工智能框架许可证分析',
      sbom: 'ai-framework-v2.3.cdx',
      sbomId: 'SBOM012',
      author: '张律师',
      time: '2024-01-10 10:15:15',
      format: 'Word',
    },
    {
      id: 'R013',
      name: '数据库系统合规性评估',
      sbom: 'database-system-v4.2.spdx',
      sbomId: 'SBOM013',
      author: '刘律师',
      time: '2024-01-09 14:45:30',
      format: 'PDF',
    },
    {
      id: 'R014',
      name: '网络安全工具开源审查',
      sbom: 'security-tools-v2.1.cdx',
      sbomId: 'SBOM014',
      author: '李律师',
      time: '2024-01-09 09:30:25',
      format: 'Word',
    },
    {
      id: 'R015',
      name: '容器化平台合规检查',
      sbom: 'container-platform-v1.7.spdx',
      sbomId: 'SBOM015',
      author: '王律师',
      time: '2024-01-08 16:20:10',
      format: 'PDF',
    },
    {
      id: 'R016',
      name: '微服务架构开源许可证分析',
      sbom: 'microservices-v3.5.cdx',
      sbomId: 'SBOM016',
      author: '张律师',
      time: '2024-01-08 11:05:40',
      format: 'Word',
    },
    {
      id: 'R017',
      name: '前端框架合规性评估',
      sbom: 'frontend-framework-v2.9.spdx',
      sbomId: 'SBOM017',
      author: '刘律师',
      time: '2024-01-07 15:15:25',
      format: 'PDF',
    },
    {
      id: 'R018',
      name: '后端服务开源组件审查',
      sbom: 'backend-services-v1.6.cdx',
      sbomId: 'SBOM018',
      author: '李律师',
      time: '2024-01-07 10:25:15',
      format: 'Word',
    },
    {
      id: 'R019',
      name: 'API接口合规性报告',
      sbom: 'api-interfaces-v2.4.spdx',
      sbomId: 'SBOM019',
      author: '王律师',
      time: '2024-01-06 14:35:30',
      format: 'PDF',
    },
    {
      id: 'R020',
      name: '移动游戏合规性分析',
      sbom: 'mobile-game-v1.3.cdx',
      sbomId: 'SBOM020',
      author: '张律师',
      time: '2024-01-06 09:40:20',
      format: 'Word',
    },
    {
      id: 'R021',
      name: '企业应用集成合规检查',
      sbom: 'enterprise-integration-v2.6.spdx',
      sbomId: 'SBOM021',
      author: '刘律师',
      time: '2024-01-05 16:10:15',
      format: 'PDF',
    },
    {
      id: 'R022',
      name: '开源工具链许可证评估',
      sbom: 'toolchain-v1.4.cdx',
      sbomId: 'SBOM022',
      author: '李律师',
      time: '2024-01-05 11:15:45',
      format: 'Word',
    },
    {
      id: 'R023',
      name: '嵌入式系统合规性报告',
      sbom: 'embedded-system-v1.1.spdx',
      sbomId: 'SBOM023',
      author: '王律师',
      time: '2024-01-04 14:25:20',
      format: 'PDF',
    },
    {
      id: 'R024',
      name: '大数据平台开源审查',
      sbom: 'bigdata-platform-v2.7.cdx',
      sbomId: 'SBOM024',
      author: '张律师',
      time: '2024-01-04 09:35:10',
      format: 'Word',
    },
  ];

  // 状态管理
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filteredReports, setFilteredReports] = useState<Report[]>([...mockReports]);
  const [reportSearch, setReportSearch] = useState('');
  const [sbomSearch, setSbomSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('');

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 报告列表';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // 应用搜索和筛选
  const applyFilters = () => {
    let result = [...mockReports];

    // 应用搜索过滤
    if (reportSearch) {
      result = result.filter(report =>
        report.name.toLowerCase().includes(reportSearch.toLowerCase())
      );
    }

    if (sbomSearch) {
      result = result.filter(report =>
        report.sbom.toLowerCase().includes(sbomSearch.toLowerCase())
      );
    }

    // 应用时间过滤
    if (timeFilter) {
      const now = new Date();
      const cutoffDate = new Date();

      switch (timeFilter) {
      case 'today':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      }

      result = result.filter(report => {
        const reportDate = new Date(report.time);
        return reportDate >= cutoffDate;
      });
    }

    // 应用格式过滤
    if (formatFilter) {
      result = result.filter(report => report.format.toLowerCase() === formatFilter);
    }

    // 应用排序
    if (sortField) {
      result.sort((a, b) => {
        let aValue: string | number | Date = a[sortField];
        let bValue: string | number | Date = b[sortField];

        if (sortField === 'time') {
          aValue = new Date(aValue as string);
          bValue = new Date(bValue as string);
        } else {
          aValue = (aValue as string).toLowerCase();
          bValue = (bValue as string).toLowerCase();
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    setFilteredReports(result);
  };

  // 当搜索或筛选条件变化时应用过滤
  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [reportSearch, sbomSearch, timeFilter, formatFilter, sortField, sortOrder]);

  // 处理排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // 清除筛选
  const clearFilters = () => {
    setReportSearch('');
    setSbomSearch('');
    setTimeFilter('');
    setFormatFilter('');
  };

  // 下载报告
  const downloadReport = (reportId: string, format: string) => {
    console.log(`下载报告: ${reportId}.${format.toLowerCase()}`);
    // 模拟下载功能
    const link = document.createElement('a');
    link.href = `#download-report-${reportId}`;
    link.download = `report-${reportId}.${format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 删除报告
  const deleteReport = (reportId: string) => {
    if (confirm('确定要删除这份报告吗？此操作不可撤销。')) {
      console.log(`删除报告: ${reportId}`);
      // 从mock数据中删除
      // 更新状态
      const updatedFilteredReports = filteredReports.filter(report => report.id !== reportId);
      setFilteredReports(updatedFilteredReports);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取格式样式类
  const getFormatClass = (format: string) => {
    return format === 'PDF' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  // 计算分页信息
  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = filteredReports.slice(startIndex, endIndex);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // 生成页码按钮
  const generatePageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (currentPage > 4) {
        pageNumbers.push(-1); // 省略号标记
      }

      const startPage = Math.max(2, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 3) {
        pageNumbers.push(-1); // 省略号标记
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
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
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full"></span>
            </button>

            {/* 用户头像 */}
            <div className="relative">
              <Link
                to="/profile"
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50"
              >
                <img
                  src="https://s.coze.cn/image/mEyWI_wAFpM/"
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
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium`}
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">报告列表</h2>
              <nav className="text-sm text-text-secondary">
                <span>报告列表</span>
              </nav>
            </div>
          </div>
        </div>

        {/* 工具栏区域 */}
        <div className="bg-white rounded-xl shadow-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* 搜索框 */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="搜索报告名称..."
                  value={reportSearch}
                  onChange={e => setReportSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm"></i>
              </div>

              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="搜索关联SBOM..."
                  value={sbomSearch}
                  onChange={e => setSbomSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <i className="fas fa-file-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm"></i>
              </div>
            </div>

            {/* 筛选条件 */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={timeFilter}
                onChange={e => setTimeFilter(e.target.value as TimeFilter)}
                className="px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">全部时间</option>
                <option value="today">今天</option>
                <option value="week">最近一周</option>
                <option value="month">最近一月</option>
                <option value="quarter">最近三月</option>
              </select>

              <select
                value={formatFilter}
                onChange={e => setFormatFilter(e.target.value as FormatFilter)}
                className="px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">全部格式</option>
                <option value="pdf">PDF</option>
                <option value="word">Word</option>
              </select>

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-text-secondary border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
              >
                清除筛选
              </button>
            </div>
          </div>
        </div>

        {/* 内容展示区域 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {/* 表格头部 */}
          <div className="px-6 py-4 border-b border-border-light">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                共 <span>{totalItems}</span> 份报告
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">每页显示</span>
                <select
                  value={pageSize}
                  onChange={e => handlePageSizeChange(parseInt(e.target.value))}
                  className="px-2 py-1 border border-border-light rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>

          {/* 表格内容 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    <button
                      className={`${styles.sortable} flex items-center ${sortField === 'name' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''}`}
                      onClick={() => handleSort('name')}
                    >
                      报告名称
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    <button
                      className={`${styles.sortable} flex items-center ${sortField === 'sbom' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''}`}
                      onClick={() => handleSort('sbom')}
                    >
                      关联SBOM
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    <button
                      className={`${styles.sortable} flex items-center ${sortField === 'author' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''}`}
                      onClick={() => handleSort('author')}
                    >
                      生成人
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    <button
                      className={`${styles.sortable} flex items-center ${sortField === 'time' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''}`}
                      onClick={() => handleSort('time')}
                    >
                      生成时间
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    <button
                      className={`${styles.sortable} flex items-center ${sortField === 'format' ? (sortOrder === 'asc' ? styles.sortAsc : styles.sortDesc) : ''}`}
                      onClick={() => handleSort('format')}
                    >
                      格式
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {currentPageData.map(report => (
                  <tr key={report.id} className={styles.tableRow}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{report.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/sbom-detail?sbomId=${report.sbomId}`}
                        className="text-sm text-primary hover:text-blue-700"
                      >
                        {report.sbom}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">{report.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">{formatDate(report.time)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFormatClass(report.format)}`}
                      >
                        {report.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => downloadReport(report.id, report.format)}
                        className="text-primary hover:text-blue-700"
                      >
                        <i className="fas fa-download mr-1"></i>下载
                      </button>
                      <button
                        onClick={() => deleteReport(report.id)}
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
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <span>显示</span>
                <span>{startItem}</span>
                <span>-</span>
                <span>{endItem}</span>
                <span>共</span>
                <span>{totalItems}</span>
                <span>条</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-border-light rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>

                <div className="flex space-x-1">
                  {generatePageNumbers().map(pageNum =>
                    pageNum === -1 ? (
                      <span key="ellipsis" className="px-3 py-1 text-text-secondary">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 border rounded text-sm ${
                          pageNum === currentPage
                            ? 'bg-primary text-white border-primary'
                            : 'border-border-light hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-border-light rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportListPage;
