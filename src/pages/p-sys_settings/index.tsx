import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface LogEntry {
  id: string;
  time: string;
  user: string;
  type: string;
  detail: string;
  ip: string;
}

const SysSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  // 配置项展开状态
  const [expandedSections, setExpandedSections] = useState<{
    basic: boolean;
    notification: boolean;
    backup: boolean;
    logs: boolean;
  }>({
    basic: true,
    notification: false,
    backup: false,
    logs: false,
  });

  // 表单数据
  const [basicConfig, setBasicConfig] = useState({
    systemName: '开源合规智能助手',
    systemVersion: 'v1.0.0',
    companyName: '开源合规智能助手',
    contactEmail: 'support@lvzhihe.com',
  });

  const [notificationConfig, setNotificationConfig] = useState({
    emailNotification: true,
    systemNotification: true,
    reviewCompletedNotification: true,
    kbUpdateNotification: false,
  });

  const [backupConfig, setBackupConfig] = useState({
    backupFrequency: 'weekly',
    backupRetention: '30',
    autoBackup: true,
  });

  // 操作状态
  const [isBasicSaving, setIsBasicSaving] = useState(false);
  const [isNotificationSaving, setIsNotificationSaving] = useState(false);
  const [isBackupSaving, setIsBackupSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // 日志搜索和筛选
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('');

  // 模拟日志数据
  const [logEntries] = useState<LogEntry[]>([
    {
      id: '1',
      time: '2024-01-15 14:30:25',
      user: '张律师',
      type: '登录',
      detail: '用户登录系统',
      ip: '192.168.1.100',
    },
    {
      id: '2',
      time: '2024-01-15 14:25:12',
      user: '李律师',
      type: '上传',
      detail: '上传SBOM文件: project-x-v2.1.spdx',
      ip: '192.168.1.105',
    },
    {
      id: '3',
      time: '2024-01-15 14:20:45',
      user: '王律师',
      type: '编辑',
      detail: '编辑知识库文档: 开源许可证指南v2.0.pdf',
      ip: '192.168.1.102',
    },
    {
      id: '4',
      time: '2024-01-15 14:15:30',
      user: '张律师',
      type: '生成',
      detail: '生成评审报告: 电商平台合规评审报告.pdf',
      ip: '192.168.1.100',
    },
    {
      id: '5',
      time: '2024-01-15 14:10:18',
      user: '系统管理员',
      type: '配置',
      detail: '更新系统通知设置',
      ip: '192.168.1.1',
    },
  ]);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = ' - 系统设置';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // 处理配置项展开/收起
  const handleSectionToggle = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => {
      const newState = { ...prev };
      // 收起所有其他配置项
      Object.keys(newState).forEach(key => {
        if (key !== section) {
          newState[key as keyof typeof newState] = false;
        }
      });
      // 切换当前配置项状态
      newState[section] = !prev[section];
      return newState;
    });
  };

  // 处理基本配置表单提交
  const handleBasicConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBasicSaving(true);

    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsBasicSaving(false);
  };

  // 处理通知配置表单提交
  const handleNotificationConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsNotificationSaving(true);

    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsNotificationSaving(false);
  };

  // 处理备份配置表单提交
  const handleBackupConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBackupSaving(true);

    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsBackupSaving(false);
  };

  // 处理手动备份
  const handleManualBackup = async () => {
    setIsBackingUp(true);

    // 模拟备份操作
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIsBackingUp(false);
  };

  // 筛选日志
  const filteredLogs = logEntries.filter(log => {
    const matchesSearch =
      log.detail.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(logSearchTerm.toLowerCase());
    const matchesType =
      !logTypeFilter || log.type.toLowerCase().includes(logTypeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  // 获取日志类型样式
  const getLogTypeStyle = (type: string) => {
    switch (type) {
    case '登录':
      return 'px-2 py-1 bg-primary bg-opacity-10 text-primary text-xs rounded-full';
    case '上传':
      return 'px-2 py-1 bg-success bg-opacity-10 text-success text-xs rounded-full';
    case '编辑':
      return 'px-2 py-1 bg-warning bg-opacity-10 text-warning text-xs rounded-full';
    case '生成':
      return 'px-2 py-1 bg-info bg-opacity-10 text-info text-xs rounded-full';
    case '配置':
      return 'px-2 py-1 bg-secondary bg-opacity-10 text-secondary text-xs rounded-full';
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full';
    }
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
                  src="https://s.coze.cn/image/-yWyhjr9Smw/"
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
          <div
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium`}
          >
            <i className="fas fa-cog text-lg"></i>
            <span>系统设置</span>
          </div>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">系统设置</h2>
              <nav className="text-sm text-text-secondary">
                <span>系统设置</span>
              </nav>
            </div>
          </div>
        </div>

        {/* 配置项列表 */}
        <div className="space-y-6">
          {/* 基本配置 */}
          <div
            className={`${styles.configSection} ${expandedSections.basic ? styles.expanded : styles.collapsed} bg-white rounded-xl shadow-card overflow-hidden`}
          >
            <div
              className="flex items-center justify-between p-6 cursor-pointer"
              onClick={() => handleSectionToggle('basic')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-info-circle text-primary"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">基本配置</h3>
                  <p className="text-sm text-text-secondary">配置系统基础信息</p>
                </div>
              </div>
              <i
                className={`fas fa-chevron-down text-text-secondary transition-transform ${expandedSections.basic ? 'rotate-180' : ''}`}
              ></i>
            </div>
            <div className={`${styles.configContent} px-6 pb-6`}>
              <form onSubmit={handleBasicConfigSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="system-name"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      系统名称
                    </label>
                    <input
                      type="text"
                      id="system-name"
                      value={basicConfig.systemName}
                      onChange={e =>
                        setBasicConfig(prev => ({ ...prev, systemName: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="system-version"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      系统版本
                    </label>
                    <input
                      type="text"
                      id="system-version"
                      value={basicConfig.systemVersion}
                      onChange={e =>
                        setBasicConfig(prev => ({ ...prev, systemVersion: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="company-name"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      公司名称
                    </label>
                    <input
                      type="text"
                      id="company-name"
                      value={basicConfig.companyName}
                      onChange={e =>
                        setBasicConfig(prev => ({ ...prev, companyName: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      联系邮箱
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      value={basicConfig.contactEmail}
                      onChange={e =>
                        setBasicConfig(prev => ({ ...prev, contactEmail: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isBasicSaving}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isBasicSaving ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>保存中...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>保存配置
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 通知设置 */}
          <div
            className={`${styles.configSection} ${expandedSections.notification ? styles.expanded : styles.collapsed} bg-white rounded-xl shadow-card overflow-hidden`}
          >
            <div
              className="flex items-center justify-between p-6 cursor-pointer"
              onClick={() => handleSectionToggle('notification')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-bell text-warning"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">通知设置</h3>
                  <p className="text-sm text-text-secondary">配置系统通知方式</p>
                </div>
              </div>
              <i
                className={`fas fa-chevron-down text-text-secondary transition-transform ${expandedSections.notification ? 'rotate-180' : ''}`}
              ></i>
            </div>
            <div className={`${styles.configContent} px-6 pb-6`}>
              <form onSubmit={handleNotificationConfigSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="email-notification"
                      checked={notificationConfig.emailNotification}
                      onChange={e =>
                        setNotificationConfig(prev => ({
                          ...prev,
                          emailNotification: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary"
                    />
                    <label
                      htmlFor="email-notification"
                      className="text-sm font-medium text-text-primary"
                    >
                      邮件通知
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="system-notification"
                      checked={notificationConfig.systemNotification}
                      onChange={e =>
                        setNotificationConfig(prev => ({
                          ...prev,
                          systemNotification: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary"
                    />
                    <label
                      htmlFor="system-notification"
                      className="text-sm font-medium text-text-primary"
                    >
                      系统内通知
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="review-completed-notification"
                      checked={notificationConfig.reviewCompletedNotification}
                      onChange={e =>
                        setNotificationConfig(prev => ({
                          ...prev,
                          reviewCompletedNotification: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary"
                    />
                    <label
                      htmlFor="review-completed-notification"
                      className="text-sm font-medium text-text-primary"
                    >
                      评审完成通知
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="kb-update-notification"
                      checked={notificationConfig.kbUpdateNotification}
                      onChange={e =>
                        setNotificationConfig(prev => ({
                          ...prev,
                          kbUpdateNotification: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary"
                    />
                    <label
                      htmlFor="kb-update-notification"
                      className="text-sm font-medium text-text-primary"
                    >
                      知识库更新通知
                    </label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isNotificationSaving}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isNotificationSaving ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>保存中...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>保存配置
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 数据备份 */}
          <div
            className={`${styles.configSection} ${expandedSections.backup ? styles.expanded : styles.collapsed} bg-white rounded-xl shadow-card overflow-hidden`}
          >
            <div
              className="flex items-center justify-between p-6 cursor-pointer"
              onClick={() => handleSectionToggle('backup')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-database text-success"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">数据备份</h3>
                  <p className="text-sm text-text-secondary">配置数据备份策略</p>
                </div>
              </div>
              <i
                className={`fas fa-chevron-down text-text-secondary transition-transform ${expandedSections.backup ? 'rotate-180' : ''}`}
              ></i>
            </div>
            <div className={`${styles.configContent} px-6 pb-6`}>
              <form onSubmit={handleBackupConfigSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="backup-frequency"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      备份频率
                    </label>
                    <select
                      id="backup-frequency"
                      value={backupConfig.backupFrequency}
                      onChange={e =>
                        setBackupConfig(prev => ({ ...prev, backupFrequency: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="daily">每日备份</option>
                      <option value="weekly">每周备份</option>
                      <option value="monthly">每月备份</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="backup-retention"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      备份保留
                    </label>
                    <select
                      id="backup-retention"
                      value={backupConfig.backupRetention}
                      onChange={e =>
                        setBackupConfig(prev => ({ ...prev, backupRetention: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="7">保留7天</option>
                      <option value="30">保留30天</option>
                      <option value="90">保留90天</option>
                      <option value="180">保留180天</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="auto-backup"
                    checked={backupConfig.autoBackup}
                    onChange={e =>
                      setBackupConfig(prev => ({ ...prev, autoBackup: e.target.checked }))
                    }
                    className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary"
                  />
                  <label htmlFor="auto-backup" className="text-sm font-medium text-text-primary">
                    启用自动备份
                  </label>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleManualBackup}
                    disabled={isBackingUp}
                    className="px-6 py-2 bg-info text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
                  >
                    {isBackingUp ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>备份中...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-download mr-2"></i>手动备份
                      </>
                    )}
                  </button>
                  <button
                    type="submit"
                    disabled={isBackupSaving}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isBackupSaving ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>保存中...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>保存配置
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 操作日志 */}
          <div
            className={`${styles.configSection} ${expandedSections.logs ? styles.expanded : styles.collapsed} bg-white rounded-xl shadow-card overflow-hidden`}
          >
            <div
              className="flex items-center justify-between p-6 cursor-pointer"
              onClick={() => handleSectionToggle('logs')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-info bg-opacity-10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-history text-info"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">操作日志</h3>
                  <p className="text-sm text-text-secondary">查看系统操作日志</p>
                </div>
              </div>
              <i
                className={`fas fa-chevron-down text-text-secondary transition-transform ${expandedSections.logs ? 'rotate-180' : ''}`}
              ></i>
            </div>
            <div className={`${styles.configContent} px-6 pb-6`}>
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="搜索操作日志..."
                    value={logSearchTerm}
                    onChange={e => setLogSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <select
                    value={logTypeFilter}
                    onChange={e => setLogTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">所有类型</option>
                    <option value="login">登录</option>
                    <option value="upload">上传</option>
                    <option value="edit">编辑</option>
                    <option value="delete">删除</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-light">
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                        操作时间
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                        用户
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                        操作类型
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                        操作详情
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                        IP地址
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="border-b border-border-light hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-text-primary">{log.time}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{log.user}</td>
                        <td className="py-3 px-4">
                          <span className={getLogTypeStyle(log.type)}>{log.type}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary">{log.detail}</td>
                        <td className="py-3 px-4 text-sm text-text-secondary">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-text-secondary">
                  显示 1-{filteredLogs.length} 条，共 156 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 border border-border-light rounded hover:bg-gray-50">
                    上一页
                  </button>
                  <button className="px-3 py-1 bg-primary text-white rounded">1</button>
                  <button className="px-3 py-1 border border-border-light rounded hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-1 border border-border-light rounded hover:bg-gray-50">
                    3
                  </button>
                  <button className="px-3 py-1 border border-border-light rounded hover:bg-gray-50">
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SysSettingsPage;
