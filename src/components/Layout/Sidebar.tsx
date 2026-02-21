import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  BookOutlined,
  UserOutlined,
  SettingOutlined,
  UploadOutlined,
  FileSearchOutlined,
  FilePdfOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';

const { Sider } = Layout;

const menuItems = [
  {
    key: '/home',
    icon: <HomeOutlined />,
    label: '首页',
  },
  {
    key: 'sbom',
    icon: <FileTextOutlined />,
    label: 'SBOM管理',
    children: [
      {
        key: '/sbom-list',
        label: 'SBOM列表',
        icon: <FileTextOutlined />,
      },
      {
        key: '/sbom-upload',
        label: 'SBOM上传',
        icon: <UploadOutlined />,
      },
    ],
  },
  {
    key: 'knowledge',
    icon: <BookOutlined />,
    label: '知识库',
    children: [
      {
        key: '/kb-list',
        label: '知识库列表',
        icon: <BookOutlined />,
      },
      {
        key: '/kb-category',
        label: '分类管理',
        icon: <SafetyCertificateOutlined />,
      },
      {
        key: '/kb-import',
        label: '文档导入',
        icon: <UploadOutlined />,
      },
    ],
  },
  {
    key: '/review-result',
    icon: <FileSearchOutlined />,
    label: '合规评审',
  },
  {
    key: 'report',
    icon: <FilePdfOutlined />,
    label: '报告管理',
    children: [
      {
        key: '/report-list',
        label: '报告列表',
        icon: <FilePdfOutlined />,
      },
      {
        key: '/report-generate',
        label: '生成报告',
        icon: <FilePdfOutlined />,
      },
    ],
  },
  {
    key: 'user',
    icon: <UserOutlined />,
    label: '用户管理',
    children: [
      {
        key: '/user-manage',
        label: '用户列表',
        icon: <TeamOutlined />,
      },
      {
        key: '/role-manage',
        label: '角色管理',
        icon: <SafetyCertificateOutlined />,
      },
    ],
  },
  {
    key: '/sys-settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed } = useAppStore();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    // 如果是子路由，返回父级菜单的 key
    for (const item of menuItems) {
      if (item.children) {
        const child = item.children.find(child => child.key === path);
        if (child) {
          return [child.key];
        }
      } else if (item.key === path) {
        return [item.key];
      }
    }
    return [path];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    // 根据当前路径展开对应的父级菜单
    for (const item of menuItems) {
      if (item.children) {
        const child = item.children.find(child => child.key === path);
        if (child) {
          return [item.key];
        }
      }
    }
    return [];
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={sidebarCollapsed}
      className="bg-white shadow-sm"
      width={240}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 text-center border-b border-border-light">
          <h2
            className={`text-primary font-semibold m-0 transition-all duration-300 ${sidebarCollapsed ? 'text-sm' : 'text-lg'}`}
          >
            {sidebarCollapsed ? 'OC' : '开源合规'}
          </h2>
        </div>

        <Menu
          mode="inline"
          theme="light"
          items={menuItems}
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          onClick={handleMenuClick}
          className="flex-1 border-r-0"
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
