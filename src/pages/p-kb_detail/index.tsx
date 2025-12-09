

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';

interface Document {
  id: string;
  title: string;
  tags: string[];
  uploader: string;
  uploadTime: string;
  fileType: string;
}

interface FilterState {
  searchTerm: string;
  tagFilter: string;
  timeFilter: string;
  typeFilter: string;
}

const KnowledgeBaseDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // 模拟文档数据
  const mockDocuments: Document[] = [
    {
      id: 'doc1',
      title: '开源许可证指南v2.0',
      tags: ['许可证', '合规'],
      uploader: '张律师',
      uploadTime: '2024-01-15 14:30',
      fileType: 'PDF'
    },
    {
      id: 'doc2',
      title: '专利法实施细则解读',
      tags: ['专利', '法律'],
      uploader: '李律师',
      uploadTime: '2024-01-14 09:15',
      fileType: 'Word'
    },
    {
      id: 'doc3',
      title: '软件版权保护案例分析',
      tags: ['版权', '案例'],
      uploader: '王律师',
      uploadTime: '2024-01-13 16:45',
      fileType: 'PDF'
    },
    {
      id: 'doc4',
      title: '企业合规管理最佳实践',
      tags: ['合规', '管理'],
      uploader: '赵律师',
      uploadTime: '2024-01-12 11:20',
      fileType: 'Markdown'
    },
    {
      id: 'doc5',
      title: 'GPL许可证详解',
      tags: ['许可证', 'GPL'],
      uploader: '张律师',
      uploadTime: '2024-01-11 13:50',
      fileType: 'PDF'
    },
    {
      id: 'doc6',
      title: 'Apache许可证条款分析',
      tags: ['许可证', 'Apache'],
      uploader: '李律师',
      uploadTime: '2024-01-10 10:15',
      fileType: 'Word'
    },
    {
      id: 'doc7',
      title: 'MIT许可证使用说明',
      tags: ['许可证', 'MIT'],
      uploader: '王律师',
      uploadTime: '2024-01-09 15:30',
      fileType: '文本'
    },
    {
      id: 'doc8',
      title: '知识产权保护策略',
      tags: ['专利', '版权', '策略'],
      uploader: '赵律师',
      uploadTime: '2024-01-08 12:45',
      fileType: 'PDF'
    }
  ];

  // 状态管理
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([...mockDocuments]);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    tagFilter: '',
    timeFilter: '',
    typeFilter: ''
  });

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 知识库详情';
    return () => { document.title = originalTitle; };
  }, []);

  // 获取知识库ID并设置标题
  const kbId = searchParams.get('kbId') || 'legal';
  
  const getKnowledgeBaseTitle = (kbId: string): string => {
    switch (kbId) {
      case 'legal':
        return '法律知识库';
      case 'internal':
        return '内部知识库';
      default:
        return '自定义知识库';
    }
  };

  const knowledgeBaseTitle = getKnowledgeBaseTitle(kbId);

  // 应用所有筛选条件
  const applyFilters = () => {
    const filtered = mockDocuments.filter(doc => {
      // 搜索筛选
      const matchesSearch = !filters.searchTerm || 
        doc.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      // 标签筛选
      const matchesTag = !filters.tagFilter || doc.tags.includes(filters.tagFilter);
      
      // 时间筛选
      const matchesTime = !filters.timeFilter || checkTimeFilter(doc.uploadTime, filters.timeFilter);
      
      // 文件类型筛选
      const matchesType = !filters.typeFilter || doc.fileType.toLowerCase() === filters.typeFilter;
      
      return matchesSearch && matchesTag && matchesTime && matchesType;
    });
    
    setFilteredDocuments(filtered);
    setCurrentPage(1);
    setSelectedDocuments(new Set());
  };

  // 检查时间筛选
  const checkTimeFilter = (uploadTime: string, filter: string): boolean => {
    const uploadDate = new Date(uploadTime);
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return uploadDate.toDateString() === now.toDateString();
      case 'week':
        return uploadDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return uploadDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarter':
        return uploadDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  };

  // 当筛选条件变化时应用筛选
  useEffect(() => {
    applyFilters();
  }, [filters]);

  // 获取当前页的文档
  const getCurrentPageDocuments = (): Document[] => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredDocuments.slice(startIndex, endIndex);
  };

  // 处理搜索输入
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  // 处理筛选器变化
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>, filterType: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [filterType]: e.target.value }));
  };

  // 处理全选
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const currentPageDocs = getCurrentPageDocuments();
    
    if (isChecked) {
      const newSelected = new Set(selectedDocuments);
      currentPageDocs.forEach(doc => newSelected.add(doc.id));
      setSelectedDocuments(newSelected);
    } else {
      const newSelected = new Set(selectedDocuments);
      currentPageDocs.forEach(doc => newSelected.delete(doc.id));
      setSelectedDocuments(newSelected);
    }
  };

  // 处理文档复选框变化
  const handleDocumentCheckboxChange = (docId: string, checked: boolean) => {
    const newSelected = new Set(selectedDocuments);
    if (checked) {
      newSelected.add(docId);
    } else {
      newSelected.delete(docId);
    }
    setSelectedDocuments(newSelected);
  };

  // 检查是否全选
  const isAllSelected = (): boolean => {
    const currentPageDocs = getCurrentPageDocuments();
    return currentPageDocs.length > 0 && currentPageDocs.every(doc => selectedDocuments.has(doc.id));
  };

  // 检查是否部分选中
  const isIndeterminate = (): boolean => {
    const currentPageDocs = getCurrentPageDocuments();
    const selectedCount = currentPageDocs.filter(doc => selectedDocuments.has(doc.id)).length;
    return selectedCount > 0 && selectedCount < currentPageDocs.length;
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedDocuments.size === 0) return;
    
    if (confirm(`确定要删除选中的 ${selectedDocuments.size} 个文档吗？`)) {
      console.log('批量删除文档:', Array.from(selectedDocuments));
      alert('删除成功');
      setSelectedDocuments(new Set());
    }
  };

  // 处理批量分类
  const handleBatchCategory = () => {
    if (selectedDocuments.size === 0) return;
    
    console.log('批量分类文档:', Array.from(selectedDocuments));
    alert('打开分类管理弹窗');
  };

  // 处理文档导入
  const handleImportDocs = () => {
    console.log('打开文档导入弹窗，知识库ID:', kbId);
    alert('打开文档导入弹窗');
  };

  // 处理新建文档
  const handleNewDoc = () => {
    console.log('打开文档编辑弹窗（新建模式），知识库ID:', kbId);
    alert('打开新建文档弹窗');
  };

  // 处理页面大小变更
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // 切换页面
  const changePage = (page: number) => {
    const totalPages = Math.ceil(filteredDocuments.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 处理表格排序
  const handleSort = (sortField: string) => {
    console.log('排序字段:', sortField);
    alert('排序功能');
  };

  // 处理文档操作
  const handleDocumentAction = (action: string, docId: string) => {
    switch (action) {
      case 'view':
      case 'edit':
        console.log(`${action}文档:`, docId);
        alert('打开文档编辑弹窗');
        break;
      case 'category':
        console.log('分类文档:', docId);
        alert('打开分类管理弹窗');
        break;
      case 'delete':
        if (confirm('确定要删除这个文档吗？')) {
          console.log('删除文档:', docId);
          alert('删除成功');
        }
        break;
    }
  };

  // 生成页码按钮
  const generatePageNumbers = () => {
    const totalPages = Math.ceil(filteredDocuments.length / pageSize);
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`px-3 py-1 border border-border-light rounded text-sm ${
            i === currentPage ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'
          }`}
          onClick={() => changePage(i)}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  const totalItems = filteredDocuments.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const currentPageDocs = getCurrentPageDocuments();

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
                  src="https://s.coze.cn/image/wfXWrVnHyXM/" 
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
          <Link to="/sbom-list" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}>
            <i className="fas fa-file-alt text-lg"></i>
            <span>SBOM管理</span>
          </Link>
          <Link to="/kb-list" className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium`}>
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">{knowledgeBaseTitle}</h2>
              <nav className="text-sm text-text-secondary">
                <Link to="/kb-list" className="hover:text-primary">知识库管理</Link>
                <span className="mx-2">/</span>
                <span>{knowledgeBaseTitle}</span>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleImportDocs}
                className={`${styles.actionButton} flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700`}
              >
                <i className="fas fa-upload text-sm"></i>
                <span>导入文档</span>
              </button>
              <button 
                onClick={handleNewDoc}
                className={`${styles.actionButton} flex items-center space-x-2 px-4 py-2 border border-border-light text-text-primary rounded-lg hover:bg-gray-50`}
              >
                <i className="fas fa-plus text-sm"></i>
                <span>新建文档</span>
              </button>
            </div>
          </div>
        </div>

        {/* 工具栏区域 */}
        <div className="bg-white rounded-xl shadow-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* 搜索框 */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜索文档标题或内容..." 
                  value={filters.searchTerm}
                  onChange={handleSearchInputChange}
                  className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg ${styles.searchInput}`}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm"></i>
              </div>
            </div>
            
            {/* 筛选条件 */}
            <div className="flex items-center space-x-4">
              <select 
                value={filters.tagFilter}
                onChange={(e) => handleFilterChange(e, 'tagFilter')}
                className={`px-3 py-2 border border-border-light rounded-lg ${styles.filterSelect}`}
              >
                <option value="">全部标签</option>
                <option value="许可证">许可证</option>
                <option value="专利">专利</option>
                <option value="版权">版权</option>
                <option value="合规">合规</option>
              </select>
              
              <select 
                value={filters.timeFilter}
                onChange={(e) => handleFilterChange(e, 'timeFilter')}
                className={`px-3 py-2 border border-border-light rounded-lg ${styles.filterSelect}`}
              >
                <option value="">全部时间</option>
                <option value="today">今天</option>
                <option value="week">最近一周</option>
                <option value="month">最近一月</option>
                <option value="quarter">最近三月</option>
              </select>
              
              <select 
                value={filters.typeFilter}
                onChange={(e) => handleFilterChange(e, 'typeFilter')}
                className={`px-3 py-2 border border-border-light rounded-lg ${styles.filterSelect}`}
              >
                <option value="">全部类型</option>
                <option value="pdf">PDF</option>
                <option value="docx">Word</option>
                <option value="txt">文本</option>
                <option value="md">Markdown</option>
              </select>
            </div>
            
            {/* 批量操作 */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleBatchDelete}
                disabled={selectedDocuments.size === 0}
                className={`${styles.actionButton} px-3 py-2 text-danger border border-danger rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <i className="fas fa-trash text-sm"></i>
                <span className="ml-1">批量删除</span>
              </button>
              <button 
                onClick={handleBatchCategory}
                disabled={selectedDocuments.size === 0}
                className={`${styles.actionButton} px-3 py-2 text-primary border border-primary rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <i className="fas fa-tags text-sm"></i>
                <span className="ml-1">批量分类</span>
              </button>
            </div>
          </div>
        </div>

        {/* 内容展示区域 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {/* 表格头部 */}
          <div className="px-6 py-4 border-b border-border-light">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected()}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate();
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-border-light"
                  />
                  <span className="text-sm text-text-secondary">全选</span>
                </label>
                <span className="text-sm text-text-secondary">共 <span>{totalItems}</span> 个文档</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">每页显示</span>
                <select 
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-2 py-1 border border-border-light rounded text-sm"
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
                  <th className="w-12 px-6 py-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected()}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate();
                      }}
                      onChange={handleSelectAll}
                      className="rounded border-border-light"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('title')}
                  >
                    文档标题
                    <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    标签
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('uploader')}
                  >
                    上传人
                    <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort('upload_time')}
                  >
                    上传时间
                    <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    文件类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {currentPageDocs.map(doc => (
                  <tr key={doc.id} className={styles.tableRow}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedDocuments.has(doc.id)}
                        onChange={(e) => handleDocumentCheckboxChange(doc.id, e.target.checked)}
                        className="rounded border-border-light"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleDocumentAction('view', doc.id)}
                        className="text-primary hover:text-blue-700 font-medium"
                      >
                        {doc.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map(tag => (
                          <span key={tag} className={styles.tagItem}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {doc.uploader}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {doc.uploadTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {doc.fileType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleDocumentAction('edit', doc.id)}
                          className="text-primary hover:text-blue-700" 
                          title="编辑"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDocumentAction('category', doc.id)}
                          className="text-warning hover:text-yellow-700" 
                          title="分类"
                        >
                          <i className="fas fa-tags"></i>
                        </button>
                        <button 
                          onClick={() => handleDocumentAction('delete', doc.id)}
                          className="text-danger hover:text-red-700" 
                          title="删除"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
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
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-border-light rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="flex items-center space-x-1">
                  {generatePageNumbers()}
                </div>
                <button 
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
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
};

export default KnowledgeBaseDetailPage;

