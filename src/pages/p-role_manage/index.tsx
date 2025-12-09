

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface Role {
  name: string;
  description: string;
  permissions: {
    [key: string]: string[];
  };
}

interface RolesData {
  [key: string]: Role;
}

const RoleManagePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 角色数据
  const [rolesData, setRolesData] = useState<RolesData>({
    admin: {
      name: '管理员',
      description: '系统最高权限，可管理所有功能',
      permissions: {
        'user-manage': ['view', 'create', 'edit', 'delete'],
        'sbom-manage': ['view', 'create', 'delete'],
        'knowledge-manage': ['view', 'create', 'edit', 'delete'],
        'review-manage': ['view', 'create', 'edit', 'generate'],
        'system-manage': ['view', 'edit', 'log', 'role']
      }
    },
    lawyer: {
      name: '合规律师',
      description: '执行合规评审工作',
      permissions: {
        'user-manage': ['view'],
        'sbom-manage': ['view', 'create'],
        'knowledge-manage': ['view', 'create', 'edit'],
        'review-manage': ['view', 'create', 'edit', 'generate'],
        'system-manage': ['view', 'log']
      }
    },
    user: {
      name: '普通用户',
      description: '基础操作权限',
      permissions: {
        'user-manage': ['view'],
        'sbom-manage': ['view', 'create'],
        'knowledge-manage': ['view'],
        'review-manage': ['view', 'create']
      }
    },
    readonly: {
      name: '只读用户',
      description: '仅查看权限',
      permissions: {
        'user-manage': ['view'],
        'sbom-manage': ['view'],
        'knowledge-manage': ['view'],
        'review-manage': ['view']
      }
    }
  });

  const [currentRoleId, setCurrentRoleId] = useState<string>('admin');
  const [showNewRoleModal, setShowNewRoleModal] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRoleDescription, setNewRoleDescription] = useState<string>('');
  const [roleName, setRoleName] = useState<string>('');
  const [roleDescription, setRoleDescription] = useState<string>('');

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 角色与权限管理';
    return () => { document.title = originalTitle; };
  }, []);

  // 初始化角色信息
  useEffect(() => {
    const role = rolesData[currentRoleId];
    setRoleName(role.name);
    setRoleDescription(role.description);
  }, [currentRoleId, rolesData]);

  // 权限组配置
  const permissionGroups = [
    {
      key: 'user-manage',
      icon: 'fas fa-users',
      title: '用户管理',
      permissions: [
        { key: 'view', title: '查看用户', description: '查看系统用户信息' },
        { key: 'create', title: '创建用户', description: '创建新的系统用户' },
        { key: 'edit', title: '编辑用户', description: '修改用户信息和角色' },
        { key: 'delete', title: '删除用户', description: '删除系统用户' }
      ]
    },
    {
      key: 'sbom-manage',
      icon: 'fas fa-file-alt',
      title: 'SBOM管理',
      permissions: [
        { key: 'view', title: '查看SBOM', description: '查看SBOM文件和解析结果' },
        { key: 'create', title: '上传SBOM', description: '上传新的SBOM文件' },
        { key: 'delete', title: '删除SBOM', description: '删除SBOM文件' }
      ]
    },
    {
      key: 'knowledge-manage',
      icon: 'fas fa-book',
      title: '知识库管理',
      permissions: [
        { key: 'view', title: '查看知识库', description: '查看知识库文档' },
        { key: 'create', title: '创建知识库', description: '创建新的知识库' },
        { key: 'edit', title: '编辑知识库', description: '编辑知识库文档' },
        { key: 'delete', title: '删除知识库', description: '删除知识库和文档' }
      ]
    },
    {
      key: 'review-manage',
      icon: 'fas fa-balance-scale',
      title: '评审管理',
      permissions: [
        { key: 'view', title: '查看评审结果', description: '查看AI评审结果' },
        { key: 'create', title: '执行评审', description: '触发AI评审分析' },
        { key: 'edit', title: '编辑评审意见', description: '修改和确认评审意见' },
        { key: 'generate', title: '生成报告', description: '生成评审报告' }
      ]
    },
    {
      key: 'system-manage',
      icon: 'fas fa-cog',
      title: '系统设置',
      permissions: [
        { key: 'view', title: '查看系统设置', description: '查看系统配置信息' },
        { key: 'edit', title: '修改系统设置', description: '修改系统配置' },
        { key: 'log', title: '查看操作日志', description: '查看系统操作日志' },
        { key: 'role', title: '管理角色权限', description: '管理用户角色和权限' }
      ]
    }
  ];

  // 检查权限是否被选中
  const isPermissionChecked = (groupKey: string, permissionKey: string): boolean => {
    const role = rolesData[currentRoleId];
    return role.permissions[groupKey]?.includes(permissionKey) || false;
  };

  // 检查权限组是否全选
  const isGroupAllSelected = (groupKey: string): boolean => {
    const group = permissionGroups.find(g => g.key === groupKey);
    if (!group) return false;
    
    const role = rolesData[currentRoleId];
    const groupPermissions = role.permissions[groupKey] || [];
    
    return groupPermissions.length === group.permissions.length;
  };

  // 检查权限组是否部分选中
  const isGroupIndeterminate = (groupKey: string): boolean => {
    const group = permissionGroups.find(g => g.key === groupKey);
    if (!group) return false;
    
    const role = rolesData[currentRoleId];
    const groupPermissions = role.permissions[groupKey] || [];
    
    return groupPermissions.length > 0 && groupPermissions.length < group.permissions.length;
  };

  // 处理角色切换
  const handleRoleChange = (roleId: string): void => {
    setCurrentRoleId(roleId);
  };

  // 处理权限变更
  const handlePermissionChange = (groupKey: string, permissionKey: string, checked: boolean): void => {
    setRolesData(prevData => {
      const newData = { ...prevData };
      const role = { ...newData[currentRoleId] };
      const groupPermissions = [...(role.permissions[groupKey] || [])];
      
      if (checked) {
        if (!groupPermissions.includes(permissionKey)) {
          groupPermissions.push(permissionKey);
        }
      } else {
        const index = groupPermissions.indexOf(permissionKey);
        if (index > -1) {
          groupPermissions.splice(index, 1);
        }
      }
      
      if (groupPermissions.length > 0) {
        role.permissions[groupKey] = groupPermissions;
      } else {
        delete role.permissions[groupKey];
      }
      
      newData[currentRoleId] = role;
      return newData;
    });
  };

  // 处理权限组全选
  const handleGroupAllChange = (groupKey: string, checked: boolean): void => {
    const group = permissionGroups.find(g => g.key === groupKey);
    if (!group) return;
    
    setRolesData(prevData => {
      const newData = { ...prevData };
      const role = { ...newData[currentRoleId] };
      
      if (checked) {
        role.permissions[groupKey] = group.permissions.map(p => p.key);
      } else {
        delete role.permissions[groupKey];
      }
      
      newData[currentRoleId] = role;
      return newData;
    });
  };

  // 处理新建角色
  const handleNewRole = (): void => {
    setShowNewRoleModal(true);
  };

  // 处理创建角色
  const handleCreateRole = (): void => {
    if (!newRoleName.trim()) {
      alert('请输入角色名称');
      return;
    }

    const newRoleId = 'role-' + Date.now();
    
    setRolesData(prevData => ({
      ...prevData,
      [newRoleId]: {
        name: newRoleName.trim(),
        description: newRoleDescription.trim(),
        permissions: {}
      }
    }));

    setShowNewRoleModal(false);
    setNewRoleName('');
    setNewRoleDescription('');
    
    alert('角色创建成功');
  };

  // 处理取消新建角色
  const handleCancelNewRole = (): void => {
    setShowNewRoleModal(false);
    setNewRoleName('');
    setNewRoleDescription('');
  };

  // 处理删除角色
  const handleDeleteRole = (): void => {
    if (currentRoleId === 'admin') {
      alert('不能删除管理员角色');
      return;
    }

    if (confirm(`确定要删除角色"${rolesData[currentRoleId].name}"吗？`)) {
      setRolesData(prevData => {
        const newData = { ...prevData };
        delete newData[currentRoleId];
        return newData;
      });
      
      setCurrentRoleId('admin');
      alert('角色删除成功');
    }
  };

  // 处理保存更改
  const handleSave = (): void => {
    if (!roleName.trim()) {
      alert('请输入角色名称');
      return;
    }

    setRolesData(prevData => {
      const newData = { ...prevData };
      const role = { ...newData[currentRoleId] };
      role.name = roleName.trim();
      role.description = roleDescription.trim();
      newData[currentRoleId] = role;
      return newData;
    });

    alert('角色权限设置已保存');
  };

  // 处理取消
  const handleCancel = (): void => {
    navigate(-1);
  };

  // 处理关闭弹窗
  const handleCloseModal = (): void => {
    navigate(-1);
  };

  // 处理背景点击
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      navigate(-1);
    }
  };

  // 处理ESC键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        navigate(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return (
    <div className={styles.pageWrapper}>
      {/* 模态弹窗背景 */}
      <div className={`fixed inset-0 ${styles.modalBackdrop} flex items-center justify-center p-4 z-50`} onClick={handleBackdropClick}>
        {/* 模态弹窗内容 */}
        <div className={`bg-white rounded-xl shadow-modal w-full max-w-6xl max-h-[90vh] overflow-hidden ${styles.fadeIn}`}>
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between p-6 border-b border-border-light">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-users-cog text-primary text-lg"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">角色与权限管理</h2>
                <p className="text-sm text-text-secondary">管理系统角色及其对应的操作权限</p>
              </div>
            </div>
            <button 
              onClick={handleCloseModal}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* 弹窗主体内容 */}
          <div className="flex h-[calc(90vh-140px)]">
            {/* 左侧：角色列表 */}
            <div className="w-64 border-r border-border-light bg-gray-50 flex flex-col">
              {/* 新建角色按钮 */}
              <div className="p-4 border-b border-border-light">
                <button 
                  onClick={handleNewRole}
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <i className="fas fa-plus text-sm"></i>
                  <span className="text-sm font-medium">新建角色</span>
                </button>
              </div>

              {/* 角色列表 */}
              <div className="flex-1 overflow-y-auto">
                {Object.entries(rolesData).map(([roleId, role]) => (
                  <div
                    key={roleId}
                    onClick={() => handleRoleChange(roleId)}
                    className={`${styles.roleItem} ${currentRoleId === roleId ? styles.roleItemActive : ''} px-4 py-3 cursor-pointer transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-xs text-text-secondary">{role.description}</p>
                      </div>
                      <i className="fas fa-chevron-right text-xs"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧：权限配置 */}
            <div className="flex-1 flex flex-col">
              {/* 角色信息编辑 */}
              <div className="p-6 border-b border-border-light bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">{rolesData[currentRoleId]?.name || '管理员'}权限配置</h3>
                  <button 
                    onClick={handleDeleteRole}
                    className="px-3 py-1 text-sm text-danger hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    删除角色
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="role-name" className="block text-sm font-medium text-text-primary mb-2">角色名称</label>
                    <input 
                      type="text" 
                      id="role-name" 
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="role-description" className="block text-sm font-medium text-text-primary mb-2">角色描述</label>
                    <input 
                      type="text" 
                      id="role-description" 
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* 权限列表 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {permissionGroups.map((group) => (
                  <div key={group.key} className={styles.permissionGroup}>
                    <div className={`${styles.permissionGroupHeader} p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <i className={`${group.icon} text-primary`}></i>
                          <span className="font-medium text-text-primary">{group.title}</span>
                        </div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className={`${styles.permissionCheckbox} w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary`}
                            checked={isGroupAllSelected(group.key)}
                            ref={(input) => {
                              if (input) input.indeterminate = isGroupIndeterminate(group.key);
                            }}
                            onChange={(e) => handleGroupAllChange(group.key, e.target.checked)}
                          />
                          <span className="text-sm text-text-secondary">全选</span>
                        </label>
                      </div>
                    </div>
                    <div className="bg-white">
                      {group.permissions.map((permission) => (
                        <div key={permission.key} className={`${styles.permissionItem} p-4 flex items-center justify-between`}>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{permission.title}</p>
                            <p className="text-xs text-text-secondary">{permission.description}</p>
                          </div>
                          <input 
                            type="checkbox" 
                            className={`${styles.permissionCheckbox} w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary`}
                            checked={isPermissionChecked(group.key, permission.key)}
                            onChange={(e) => handlePermissionChange(group.key, permission.key, e.target.checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 弹窗底部 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light bg-gray-50">
            <button 
              onClick={handleCancel}
              className="px-6 py-2 text-sm font-medium text-text-secondary bg-white border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors"
            >
              <i className="fas fa-save mr-2"></i>
              保存更改
            </button>
          </div>
        </div>
      </div>

      {/* 新建角色弹窗 */}
      {showNewRoleModal && (
        <div className={`fixed inset-0 ${styles.modalBackdrop} flex items-center justify-center p-4 z-60`}>
          <div className={`bg-white rounded-xl shadow-modal w-full max-w-md ${styles.fadeIn}`}>
            <div className="p-6 border-b border-border-light">
              <h3 className="text-lg font-semibold text-text-primary">新建角色</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-role-name" className="block text-sm font-medium text-text-primary mb-2">角色名称</label>
                  <input 
                    type="text" 
                    id="new-role-name" 
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="请输入角色名称"
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="new-role-description" className="block text-sm font-medium text-text-primary mb-2">角色描述</label>
                  <input 
                    type="text" 
                    id="new-role-description" 
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="请输入角色描述"
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light bg-gray-50">
              <button 
                onClick={handleCancelNewRole}
                className="px-4 py-2 text-sm font-medium text-text-secondary bg-white border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleCreateRole}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors"
              >
                创建角色
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagePage;

