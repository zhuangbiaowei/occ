

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';
import styles from './styles.module.css';

interface Document {
  id: string;
  title: string;
  tags: string[];
  uploader: string;
  uploadTime: string;
  fileType: string;
}

interface DocumentResponse {
  id: string;
  title: string;
  createdAt?: string;
  fileName?: string;
  mimeType?: string;
  createdBy?: {
    fullName?: string;
    username?: string;
  };
  tags?: Array<{ name: string }>;
}

interface KnowledgeBaseResponse {
  id: string;
  name: string;
}

interface FilterState {
  searchTerm: string;
  tagFilter: string;
  timeFilter: string;
  typeFilter: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const buildAuthHeaders = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const resolveFileType = (fileName?: string, mimeType?: string) => {
  if (fileName && fileName.includes('.')) {
    const ext = fileName.split('.').pop() || '';
    return ext.toUpperCase();
  }
  if (mimeType) {
    return mimeType.split('/').pop() || mimeType;
  }
  return '未知';
};

const mapDocument = (doc: DocumentResponse): Document => ({
  id: doc.id,
  title: doc.title,
  tags: doc.tags?.map(tag => tag.name) || [],
  uploader: doc.createdBy?.fullName || doc.createdBy?.username || '系统',
  uploadTime: formatDate(doc.createdAt),
  fileType: resolveFileType(doc.fileName, doc.mimeType),
});

const KnowledgeBaseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessToken = useAuthStore(state => state.accessToken);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [knowledgeBaseTitle, setKnowledgeBaseTitle] = useState('知识库');
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    tagFilter: '',
    timeFilter: '',
    typeFilter: ''
  });

  // Set page title
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规助手 - 知识库详情';
    return () => { document.title = originalTitle; };
  }, []);

  // Get knowledge base ID and load data
  const kbId = searchParams.get('kbId') || '';

  const loadKnowledgeBase = async () => {
    if (!kbId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/knowledge-bases/${kbId}`, {
        method: 'GET',
        headers: buildAuthHeaders(accessToken),
      });
      if (!response.ok) {
        throw new Error('加载知识库失败');
      }
      const data = (await response.json()) as KnowledgeBaseResponse;
      setKnowledgeBaseTitle(data.name || '知识库');
    } catch (error) {
      setKnowledgeBaseTitle('知识库');
    }
  };

  const deleteDocument = async (docId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/${docId}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(accessToken),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || '删除文档失败');
    }
  };

  const loadDocuments = async () => {
    if (!kbId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/knowledge-bases/${kbId}/documents?page=1&pageSize=100`,
        {
          method: 'GET',
          headers: buildAuthHeaders(accessToken),
        },
      );
      if (!response.ok) {
        throw new Error('加载文档失败');
      }
      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items : [];
      setDocuments(items.map(mapDocument));
    } catch (error) {
      setDocuments([]);
      setLoadError('加载文档失败');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply all filters
  const applyFilters = () => {
    const filtered = documents.filter(doc => {
      // Search filter
      const matchesSearch = !filters.searchTerm ||
        doc.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      // Tag filter
      const matchesTag = !filters.tagFilter || doc.tags.includes(filters.tagFilter);

      // Time filter
      const matchesTime = !filters.timeFilter || checkTimeFilter(doc.uploadTime, filters.timeFilter);

      // File type filter
      const matchesType = !filters.typeFilter || doc.fileType.toLowerCase() === filters.typeFilter;
      
      return matchesSearch && matchesTag && matchesTime && matchesType;
    });
    
    setFilteredDocuments(filtered);
    setCurrentPage(1);
    setSelectedDocuments(new Set());
  };

  // Check time filter
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

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [filters, documents]);

  useEffect(() => {
    loadKnowledgeBase();
    loadDocuments();
  }, [kbId, accessToken]);

  // Get documents for current page
  const getCurrentPageDocuments = (): Document[] => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredDocuments.slice(startIndex, endIndex);
  };

  // Handle search input
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>, filterType: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [filterType]: e.target.value }));
  };

  // Handle select all
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

  // Handle document checkbox change
  const handleDocumentCheckboxChange = (docId: string, checked: boolean) => {
    const newSelected = new Set(selectedDocuments);
    if (checked) {
      newSelected.add(docId);
    } else {
      newSelected.delete(docId);
    }
    setSelectedDocuments(newSelected);
  };

  // Check if all selected
  const isAllSelected = (): boolean => {
    const currentPageDocs = getCurrentPageDocuments();
    return currentPageDocs.length > 0 && currentPageDocs.every(doc => selectedDocuments.has(doc.id));
  };

  // Check if partially selected
  const isIndeterminate = (): boolean => {
    const currentPageDocs = getCurrentPageDocuments();
    const selectedCount = currentPageDocs.filter(doc => selectedDocuments.has(doc.id)).length;
    return selectedCount > 0 && selectedCount < currentPageDocs.length;
  };

  // Handle batch delete
  const handleBatchDelete = () => {
    if (selectedDocuments.size === 0) return;

    if (confirm(`确认删除选中的 ${selectedDocuments.size} 份文档吗？`)) {
      console.log('Batch delete documents:', Array.from(selectedDocuments));
      alert('删除成功');
      setSelectedDocuments(new Set());
    }
  };

  // Handle batch categorize
  const handleBatchCategory = () => {
    if (selectedDocuments.size === 0) return;

    console.log('Batch categorize documents:', Array.from(selectedDocuments));
    alert('打开分类管理弹窗');
  };

  // Handle document import
  const handleImportDocs = () => {
    if (!kbId) {
      alert('缺少知识库ID。');
      return;
    }
    navigate(`/kb-import?kbId=${kbId}`);
  };

  // Handle new document
  const handleNewDoc = () => {
    console.log('Open document editor modal (new mode), knowledge base ID:', kbId);
    alert('打开新建文档弹窗');
  };

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Change page
  const changePage = (page: number) => {
    const totalPages = Math.ceil(filteredDocuments.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle table sort
  const handleSort = (sortField: string) => {
    console.log('Sort field:', sortField);
    alert('排序功能');
  };

  // Handle document action
  const handleDocumentAction = (action: string, docId: string) => {
    switch (action) {
      case 'view':
      case 'edit':
        console.log(`${action} document:`, docId);
        alert('打开文档编辑弹窗');
        break;
      case 'category':
        console.log('Categorize document:', docId);
        alert('打开分类管理弹窗');
        break;
      case 'delete':
        if (confirm('确认删除此文档吗？')) {
          deleteDocument(docId)
            .then(() => loadDocuments())
            .catch((error) => {
              alert(`删除失败：${error instanceof Error ? error.message : String(error)}`);
            });
        }
        break;
    }
  };

  // Generate page buttons
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
      {/* Top navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-border-light h-16 z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo and product name */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-balance-scale text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-semibold text-text-primary">开源合规助手</h1>
          </div>

          {/* Global search box */}
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

          {/* Right-side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-text-secondary hover:text-primary">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full"></span>
            </button>

            {/* User avatar */}
            <div className="relative">
              <Link to="/profile" className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50">
                <img
                  src="https://s.coze.cn/image/wfXWrVnHyXM/"
                  alt="User avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-text-primary">张律师</span>
                <i className="fas fa-chevron-down text-xs text-text-secondary"></i>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Left menu */}
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
            <span>报告</span>
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

      {/* Main content */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* Page header */}
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

        {/* Toolbar area */}
        <div className="bg-white rounded-xl shadow-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search box */}
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

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filters.tagFilter}
                onChange={(e) => handleFilterChange(e, 'tagFilter')}
                className={`px-3 py-2 border border-border-light rounded-lg ${styles.filterSelect}`}
              >
                <option value="">全部标签</option>
                <option value="License">许可证</option>
                <option value="Patent">专利</option>
                <option value="Copyright">著作权</option>
                <option value="Compliance">合规</option>
              </select>

              <select
                value={filters.timeFilter}
                onChange={(e) => handleFilterChange(e, 'timeFilter')}
                className={`px-3 py-2 border border-border-light rounded-lg ${styles.filterSelect}`}
              >
                <option value="">全部时间</option>
                <option value="today">今天</option>
                <option value="week">最近7天</option>
                <option value="month">最近30天</option>
                <option value="quarter">最近3个月</option>
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

            {/* Batch actions */}
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

        {/* Content area */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {/* Table header */}
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
                <span className="text-sm text-text-secondary">共 <span>{totalItems}</span> 份文档</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">每页</span>
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

          {/* Table body */}
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
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border-light">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <span>显示</span>
                <span>{startItem}</span>
                <span>至</span>
                <span>{endItem}</span>
                <span>/</span>
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

