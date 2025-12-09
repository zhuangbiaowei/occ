

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  creator: string;
  updatedAt: string;
  icon: string;
  iconColor: string;
  category: string;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc' | null;
}

const KnowledgeBaseListPage: React.FC = () => {
  
  // 状态管理
  const [showNewKnowledgeModal, setShowNewKnowledgeModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteKnowledgeInfo, setDeleteKnowledgeInfo] = useState<{ id: string; name: string } | null>(null);
  const [knowledgeSearchTerm, setKnowledgeSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'updated', direction: null });
  const [newKnowledgeForm, setNewKnowledgeForm] = useState({
    name: '',
    description: ''
  });

  // 模拟知识库数据
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: 'kb-legal',
      name: '法律知识库',
      description: '包含法律法规、司法解释、部门规章等公开法律文件，为合规评审提供法律依据',
      documentCount: 1247,
      creator: '李律师',
      updatedAt: '2024-01-14 16:30',
      icon: 'fas fa-gavel',
      iconColor: 'text-primary',
      category: '公开法律、法规、政策文件'
    },
    {
      id: 'kb-internal',
      name: '内部知识库',
      description: '包含内部案例、最佳实践、专业指导等，为评审提供专业经验支持',
      documentCount: 1580,
      creator: '王律师',
      updatedAt: '2024-01-13 09:15',
      icon: 'fas fa-building',
      iconColor: 'text-success',
      category: '事务所内部专业知识'
    },
    {
      id: 'kb-technical',
      name: '技术知识库',
      description: '包含技术标准、行业规范、技术文档等，为技术合规提供支持',
      documentCount: 20,
      creator: '张律师',
      updatedAt: '2024-01-12 14:22',
      icon: 'fas fa-code',
      iconColor: 'text-warning',
      category: '技术标准与规范'
    }
  ]);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 知识库管理';
    return () => { document.title = originalTitle; };
  }, []);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNewKnowledgeModal(false);
        setShowDeleteConfirmModal(false);
        setNewKnowledgeForm({ name: '', description: '' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 筛选和排序知识库
  const filteredAndSortedKnowledgeBases = React.useMemo(() => {
    let filtered = knowledgeBases;

    // 搜索筛选
    if (knowledgeSearchTerm) {
      filtered = knowledgeBases.filter(kb =>
        kb.name.toLowerCase().includes(knowledgeSearchTerm.toLowerCase())
      );
    }

    // 排序
    if (sortConfig.field && sortConfig.direction) {
      filtered.sort((a, b) => {
        let valueA: string | number;
        let valueB: string | number;

        switch (sortConfig.field) {
          case 'name':
            valueA = a.name;
            valueB = b.name;
            break;
          case 'documents':
            valueA = a.documentCount;
            valueB = b.documentCount;
            break;
          case 'creator':
            valueA = a.creator;
            valueB = b.creator;
            break;
          case 'updated':
            valueA = a.updatedAt;
            valueB = b.updatedAt;
            break;
          default:
            return 0;
        }

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortConfig.direction === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else if (typeof valueA === 'number' && typeof valueB === 'number') {
          return sortConfig.direction === 'asc' 
            ? valueA - valueB
            : valueB - valueA;
        }

        return 0;
      });
    }

    return filtered;
  }, [knowledgeBases, knowledgeSearchTerm, sortConfig]);

  // 处理排序
  const handleSort = (field: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.field === field && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ field, direction });
  };

  // 处理新建知识库
  const handleNewKnowledgeSubmit = () => {
    if (newKnowledgeForm.name.trim()) {
      const newKnowledgeBase: KnowledgeBase = {
        id: `kb-${Date.now()}`,
        name: newKnowledgeForm.name,
        description: newKnowledgeForm.description,
        documentCount: 0,
        creator: '张律师',
        updatedAt: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        icon: 'fas fa-book',
        iconColor: 'text-primary',
        category: '新建知识库'
      };

      setKnowledgeBases(prev => [...prev, newKnowledgeBase]);
      setShowNewKnowledgeModal(false);
      setNewKnowledgeForm({ name: '', description: '' });
      alert('知识库创建成功！');
    }
  };

  // 处理删除知识库
  const handleDeleteKnowledge = () => {
    if (deleteKnowledgeInfo) {
      setKnowledgeBases(prev => prev.filter(kb => kb.id !== deleteKnowledgeInfo.id));
      setShowDeleteConfirmModal(false);
      setDeleteKnowledgeInfo(null);
      alert('知识库删除成功！');
    }
  };

  // 处理模态框背景点击
  const handleModalBackgroundClick = (e: React.MouseEvent, closeModal: () => void) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // 获取排序图标
  const getSortIcon = (field: string) => {
    if (sortConfig.field !== field) {
      return 'fas fa-sort';
    }
    if (sortConfig.direction === 'asc') {
      return 'fas fa-sort-up';
    }
    if (sortConfig.direction === 'desc') {
      return 'fas fa-sort-down';
    }
    return 'fas fa-sort';
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
              <Link to="/profile" className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50">
                <img 
                  src="https://s.coze.cn/image/UEjaIBnwlpw/" 
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">知识库管理</h2>
              <nav className="text-sm text-text-secondary">
                <span>知识库管理</span>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowNewKnowledgeModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <i className="fas fa-plus text-sm"></i>
                <span>新建知识库</span>
              </button>
            </div>
          </div>
        </div>

        {/* 知识库概览 */}
        <section className="bg-white rounded-xl shadow-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">知识库概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">{knowledgeBases.length}</div>
              <div className="text-sm text-text-secondary">总知识库</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-success mb-2">
                {knowledgeBases.reduce((sum, kb) => sum + kb.documentCount, 0)}
              </div>
              <div className="text-sm text-text-secondary">文档总数</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-warning mb-2">23</div>
              <div className="text-sm text-text-secondary">本月新增</div>
            </div>
          </div>
        </section>

        {/* 知识库列表 */}
        <section className="bg-white rounded-xl shadow-card">
          {/* 工具栏 */}
          <div className="p-6 border-b border-border-light">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="搜索知识库名称..." 
                    value={knowledgeSearchTerm}
                    onChange={(e) => setKnowledgeSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm"></i>
                </div>
                <select 
                  value={sortConfig.field}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="updated">按更新时间</option>
                  <option value="name">按名称</option>
                  <option value="documents">按文档数量</option>
                </select>
              </div>
              <div className="text-sm text-text-secondary">
                共 <span>{filteredAndSortedKnowledgeBases.length}</span> 个知识库
              </div>
            </div>
          </div>

          {/* 知识库表格 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className={`px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${styles.sortableHeader}`}
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>知识库名称</span>
                      <i className={`${getSortIcon('name')} text-xs`}></i>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    描述
                  </th>
                  <th 
                    className={`px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${styles.sortableHeader}`}
                    onClick={() => handleSort('documents')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>文档数量</span>
                      <i className={`${getSortIcon('documents')} text-xs`}></i>
                    </div>
                  </th>
                  <th 
                    className={`px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${styles.sortableHeader}`}
                    onClick={() => handleSort('creator')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>创建人</span>
                      <i className={`${getSortIcon('creator')} text-xs`}></i>
                    </div>
                  </th>
                  <th 
                    className={`px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${styles.sortableHeader}`}
                    onClick={() => handleSort('updated')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>最后更新</span>
                      <i className={`${getSortIcon('updated')} text-xs`}></i>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {filteredAndSortedKnowledgeBases.map((knowledgeBase) => (
                  <tr key={knowledgeBase.id} className={styles.tableRow}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                          knowledgeBase.iconColor === 'text-primary' ? 'bg-blue-100' :
                          knowledgeBase.iconColor === 'text-success' ? 'bg-green-100' :
                          'bg-orange-100'
                        }`}>
                          <i className={`${knowledgeBase.icon} ${knowledgeBase.iconColor}`}></i>
                        </div>
                        <div>
                          <Link 
                            to={`/kb-detail?kbId=${knowledgeBase.id}`}
                            className="text-sm font-medium text-text-primary hover:text-primary"
                          >
                            {knowledgeBase.name}
                          </Link>
                          <div className="text-sm text-text-secondary">{knowledgeBase.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary">{knowledgeBase.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">{knowledgeBase.documentCount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">{knowledgeBase.creator}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">{knowledgeBase.updatedAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link 
                          to={`/kb-detail?kbId=${knowledgeBase.id}`}
                          className="text-primary hover:text-blue-700"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button 
                          onClick={() => {
                            setDeleteKnowledgeInfo({
                              id: knowledgeBase.id,
                              name: knowledgeBase.name
                            });
                            setShowDeleteConfirmModal(true);
                          }}
                          className="text-danger hover:text-red-700"
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

          {/* 分页 */}
          <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              显示 1-{filteredAndSortedKnowledgeBases.length} 条，共 {filteredAndSortedKnowledgeBases.length} 条记录
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-border-light rounded text-sm text-text-secondary hover:bg-gray-50 disabled:opacity-50" disabled>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="px-3 py-1 bg-primary text-white rounded text-sm">1</button>
              <button className="px-3 py-1 border border-border-light rounded text-sm text-text-secondary hover:bg-gray-50 disabled:opacity-50" disabled>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 新建知识库弹窗 */}
      {showNewKnowledgeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={(e) => handleModalBackgroundClick(e, () => {
            setShowNewKnowledgeModal(false);
            setNewKnowledgeForm({ name: '', description: '' });
          })}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">新建知识库</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="knowledge-name" className="block text-sm font-medium text-text-primary mb-2">
                      知识库名称 *
                    </label>
                    <input 
                      type="text" 
                      id="knowledge-name"
                      value={newKnowledgeForm.name}
                      onChange={(e) => setNewKnowledgeForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="knowledge-description" className="block text-sm font-medium text-text-primary mb-2">
                      描述
                    </label>
                    <textarea 
                      id="knowledge-description"
                      rows={3}
                      value={newKnowledgeForm.description}
                      onChange={(e) => setNewKnowledgeForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border-light flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowNewKnowledgeModal(false);
                    setNewKnowledgeForm({ name: '', description: '' });
                  }}
                  className="px-4 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-gray-50"
                >
                  取消
                </button>
                <button 
                  onClick={handleNewKnowledgeSubmit}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirmModal && deleteKnowledgeInfo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={(e) => handleModalBackgroundClick(e, () => {
            setShowDeleteConfirmModal(false);
            setDeleteKnowledgeInfo(null);
          })}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-exclamation-triangle text-danger text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">确认删除</h3>
                <p className="text-sm text-text-secondary mb-6">
                  {'确定要删除知识库 "'}<span>{deleteKnowledgeInfo.name}</span>{'" 吗？此操作不可撤销，将删除该知识库中的所有文档。'}
                </p>
                <div className="flex justify-center space-x-3">
                  <button 
                    onClick={() => {
                      setShowDeleteConfirmModal(false);
                      setDeleteKnowledgeInfo(null);
                    }}
                    className="px-4 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleDeleteKnowledge}
                    className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseListPage;

