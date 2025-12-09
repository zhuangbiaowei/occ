

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'lawyer' | 'user' | 'readonly';
  status: 'active' | 'inactive';
  created_at: string;
}

const UserManagePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 模拟用户数据
  const [mockUsers] = useState<User[]>([
    {
      id: 1,
      username: '张律师',
      email: 'zhang@lawfirm.com',
      role: 'admin',
      status: 'active',
      created_at: '2024-01-01 10:00:00'
    },
    {
      id: 2,
      username: '李律师',
      email: 'li@lawfirm.com',
      role: 'lawyer',
      status: 'active',
      created_at: '2024-01-02 14:30:00'
    },
    {
      id: 3,
      username: '王助理',
      email: 'wang@lawfirm.com',
      role: 'user',
      status: 'active',
      created_at: '2024-01-03 09:15:00'
    },
    {
      id: 4,
      username: '赵法务',
      email: 'zhao@lawfirm.com',
      role: 'lawyer',
      status: 'inactive',
      created_at: '2024-01-04 16:45:00'
    },
    {
      id: 5,
      username: '刘专员',
      email: 'liu@lawfirm.com',
      role: 'readonly',
      status: 'active',
      created_at: '2024-01-05 11:20:00'
    },
    {
      id: 6,
      username: '陈律师',
      email: 'chen@lawfirm.com',
      role: 'lawyer',
      status: 'active',
      created_at: '2024-01-06 13:10:00'
    },
    {
      id: 7,
      username: '杨助理',
      email: 'yang@lawfirm.com',
      role: 'user',
      status: 'inactive',
      created_at: '2024-01-07 15:50:00'
    },
    {
      id: 8,
      username: '黄法务',
      email: 'huang@lawfirm.com',
      role: 'lawyer',
      status: 'active',
      created_at: '2024-01-08 10:30:00'
    },
    {
      id: 9,
      username: '吴专员',
      email: 'wu@lawfirm.com',
      role: 'readonly',
      status: 'active',
      created_at: '2024-01-09 14:20:00'
    },
    {
      id: 10,
      username: '周律师',
      email: 'zhou@lawfirm.com',
      role: 'lawyer',
      status: 'active',
      created_at: '2024-01-10 11:45:00'
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([...mockUsers]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('');

  // 角色和状态的中文映射
  const roleMap = {
    'admin': '管理员',
    'lawyer': '合规律师',
    'user': '普通用户',
    'readonly': '只读用户'
  };

  const statusMap = {
    'active': '启用',
    'inactive': '禁用'
  };

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 用户管理';
    return () => { document.title = originalTitle; };
  }, []);

  // 筛选用户
  useEffect(() => {
    let filtered = mockUsers.filter(user => {
      const matchesSearch = !userSearchTerm || 
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
      
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    // 排序
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: string | number | Date = a[sortField as keyof User];
        let bValue: string | number | Date = b[sortField as keyof User];

        if (sortField === 'created_at') {
          aValue = new Date(aValue as string);
          bValue = new Date(bValue as string);
        }

        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
    setSelectedUsers(new Set());
  }, [userSearchTerm, roleFilter, statusFilter, sortField, mockUsers]);

  // 计算分页信息
  const totalCount = filteredUsers.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(currentPage * pageSize, totalCount);
  const currentPageUsers = filteredUsers.slice(startIndex, endIndex);

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = currentPageUsers.map(user => user.id);
      setSelectedUsers(new Set(currentPageIds));
    } else {
      setSelectedUsers(new Set());
    }
  };

  // 切换单个用户选择
  const handleToggleUser = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  // 检查是否全选
  const isAllSelected = currentPageUsers.length > 0 && 
    currentPageUsers.every(user => selectedUsers.has(user.id));

  // 检查是否部分选中
  const isIndeterminate = selectedUsers.size > 0 && 
    !currentPageUsers.every(user => selectedUsers.has(user.id));

  // 批量更新状态
  const batchUpdateStatus = (status: 'active' | 'inactive') => {
    if (selectedUsers.size === 0) {
      alert('请先选择要操作的用户');
      return;
    }

    const action = status === 'active' ? '启用' : '禁用';
    if (confirm(`确定要${action}选中的 ${selectedUsers.size} 个用户吗？`)) {
      // 在实际项目中，这里会调用API
      console.log(`批量${action}用户:`, Array.from(selectedUsers));
      setSelectedUsers(new Set());
      alert('批量操作完成！');
    }
  };

  // 批量删除
  const batchDelete = () => {
    if (selectedUsers.size === 0) {
      alert('请先选择要删除的用户');
      return;
    }

    if (confirm(`确定要删除选中的 ${selectedUsers.size} 个用户吗？此操作不可撤销！`)) {
      // 在实际项目中，这里会调用API
      console.log('批量删除用户:', Array.from(selectedUsers));
      setSelectedUsers(new Set());
      alert('批量删除完成！');
    }
  };

  // 更新用户状态
  const updateUserStatus = (userId: number, status: 'active' | 'inactive') => {
    // 在实际项目中，这里会调用API
    console.log(`更新用户 ${userId} 状态为 ${status}`);
  };

  // 重置密码
  const resetPassword = (userId: number) => {
    if (confirm('确定要重置该用户的密码吗？')) {
      console.log('重置用户密码，用户ID:', userId);
      alert('密码重置成功！');
    }
  };

  // 生成页码
  const generatePageNumbers = () => {
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

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'});
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
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50"
              >
                <img 
                  src="https://s.coze.cn/image/YJULa6S1upI/" 
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
          <Link to="/kb-list" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}>
            <i className="fas fa-book text-lg"></i>
            <span>知识库管理</span>
          </Link>
          <Link to="/report-list" className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}>
            <i className="fas fa-chart-line text-lg"></i>
            <span>报告列表</span>
          </Link>
          <Link to="/user-manage" className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium`}>
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">用户管理</h2>
              <nav className="text-sm text-text-secondary">
                <span>用户管理</span>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => console.log('打开角色管理弹窗')}
                className="px-4 py-2 border border-border-light rounded-lg text-sm font-medium text-text-primary hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-shield-alt mr-2"></i>
                角色管理
              </button>
              <button 
                onClick={() => console.log('打开新建用户弹窗')}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                新建用户
              </button>
            </div>
          </div>
        </div>

        {/* 工具栏区域 */}
        <div className="bg-white rounded-xl shadow-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* 搜索框 */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <input 
                  type="text" 
                  placeholder="搜索用户名或邮箱..." 
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm"></i>
              </div>
              
              {/* 筛选条件 */}
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">全部角色</option>
                <option value="admin">管理员</option>
                <option value="lawyer">合规律师</option>
                <option value="user">普通用户</option>
                <option value="readonly">只读用户</option>
              </select>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">全部状态</option>
                <option value="active">启用</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
            
            {/* 批量操作 */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => batchUpdateStatus('active')}
                disabled={selectedUsers.size === 0}
                className="px-3 py-2 border border-border-light rounded-lg text-sm text-text-primary hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <i className="fas fa-check mr-1"></i>
                批量启用
              </button>
              <button 
                onClick={() => batchUpdateStatus('inactive')}
                disabled={selectedUsers.size === 0}
                className="px-3 py-2 border border-border-light rounded-lg text-sm text-text-primary hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <i className="fas fa-ban mr-1"></i>
                批量禁用
              </button>
              <button 
                onClick={() => batchDelete()}
                disabled={selectedUsers.size === 0}
                className="px-3 py-2 border border-danger rounded-lg text-sm text-danger hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <i className="fas fa-trash mr-1"></i>
                批量删除
              </button>
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-border-light text-primary focus:ring-primary"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => setSortField('username')}
                  >
                    用户名
                    <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => setSortField('email')}
                  >
                    邮箱
                    <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => setSortField('role')}
                  >
                    角色
                    <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => setSortField('status')}
                  >
                    状态
                    <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary"
                    onClick={() => setSortField('created_at')}
                  >
                    创建时间
                    <i className="fas fa-sort ml-1"></i>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {currentPageUsers.map(user => (
                  <tr key={user.id} className={styles.tableRow}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => handleToggleUser(user.id, e.target.checked)}
                        className="rounded border-border-light text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[`roleBadge${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`]}`}>
                        {roleMap[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[`statusBadge${user.status}`]}`}>
                        {statusMap[user.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => console.log('打开用户编辑弹窗，用户ID:', user.id)}
                        className="text-primary hover:text-blue-700"
                      >
                        <i className="fas fa-edit mr-1"></i>编辑
                      </button>
                      <button 
                        onClick={() => resetPassword(user.id)}
                        className="text-warning hover:text-yellow-700"
                      >
                        <i className="fas fa-key mr-1"></i>重置密码
                      </button>
                      {user.status === 'active' ? (
                        <button 
                          onClick={() => {
                            if (confirm('确定要禁用该用户吗？')) {
                              updateUserStatus(user.id, 'inactive');
                            }
                          }}
                          className="text-danger hover:text-red-700"
                        >
                          <i className="fas fa-ban mr-1"></i>禁用
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            if (confirm('确定要启用该用户吗？')) {
                              updateUserStatus(user.id, 'active');
                            }
                          }}
                          className="text-success hover:text-green-700"
                        >
                          <i className="fas fa-check mr-1"></i>启用
                        </button>
                      )}
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
                显示第 <span>{totalCount > 0 ? startIndex + 1 : 0}</span> - <span>{endIndex}</span> 条，共 <span>{totalCount}</span> 条记录
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-border-light rounded text-sm text-text-primary hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="flex items-center space-x-1">
                  {generatePageNumbers().map(pageNum => (
                    <button 
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border rounded text-sm transition-colors ${
                        pageNum === currentPage 
                          ? 'bg-primary text-white border-primary' 
                          : 'border-border-light text-text-primary hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-border-light rounded text-sm text-text-primary hover:bg-gray-50 transition-colors disabled:opacity-50"
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

export default UserManagePage;

