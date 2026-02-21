import React from 'react';
import { Layout } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../lib/react-query';
import Header from './Header';
import Sidebar from './Sidebar';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout className="min-h-screen">
        <Sidebar />

        <Layout className="bg-bg-light">
          <Header />

          <Content className="m-6 p-6 bg-white rounded-lg shadow-card">{children}</Content>
        </Layout>
      </Layout>
    </QueryClientProvider>
  );
};

export default MainLayout;
