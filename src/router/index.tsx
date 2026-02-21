import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

import P_login from '../pages/p-login';
import P_register from '../pages/p-register';
import P_home from '../pages/p-home';
import P_sbom_list from '../pages/p-sbom_list';
import P_sbom_detail from '../pages/p-sbom_detail';
import P_review_result from '../pages/p-review_result';
import P_report_list from '../pages/p-report_list';
import P_kb_list from '../pages/p-kb_list';
import P_kb_detail from '../pages/p-kb_detail';
import P_user_manage from '../pages/p-user_manage';
import P_sys_settings from '../pages/p-sys_settings';
import P_profile from '../pages/p-profile';
import P_sbom_upload from '../pages/p-sbom_upload';
import P_kb_import from '../pages/p-kb_import';
import P_kb_edit from '../pages/p-kb_edit';
import P_kb_category from '../pages/p-kb_category';
import P_report_generate from '../pages/p-report_generate';
import P_user_edit from '../pages/p-user_edit';
import P_role_manage from '../pages/p-role_manage';
import NotFoundPage from './NotFoundPage';
import ErrorPage from './ErrorPage';

function Listener() {
  const location = useLocation();
  useEffect(() => {
    const pageId = 'P-' + location.pathname.replace('/', '').toUpperCase();
    console.log(
      '当前pageId:',
      pageId,
      ', pathname:',
      location.pathname,
      ', search:',
      location.search
    );
    if (typeof window === 'object' && window.parent && window.parent.postMessage) {
      window.parent.postMessage(
        {
          type: 'chux-path-change',
          pageId: pageId,
          pathname: location.pathname,
          search: location.search,
        },
        '*'
      );
    }
  }, [location]);

  return <Outlet />;
}

// 将 Listener 组件导出为默认导出，避免 Fast refresh 警告
export { Listener };

// 使用 createBrowserRouter 创建路由实例
const router = createBrowserRouter([
  {
    path: '/',
    element: <Listener />,
    children: [
      {
        path: '/',
        element: <Navigate to="/login" replace={true} />,
      },
      {
        path: '/login',
        element: (
          <ErrorBoundary>
            <P_login />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/register',
        element: (
          <ErrorBoundary>
            <P_register />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/home',
        element: (
          <ErrorBoundary>
            <P_home />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/sbom-list',
        element: (
          <ErrorBoundary>
            <P_sbom_list />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/sbom-detail',
        element: (
          <ErrorBoundary>
            <P_sbom_detail />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/review-result',
        element: (
          <ErrorBoundary>
            <P_review_result />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/report-list',
        element: (
          <ErrorBoundary>
            <P_report_list />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/kb-list',
        element: (
          <ErrorBoundary>
            <P_kb_list />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/kb-detail',
        element: (
          <ErrorBoundary>
            <P_kb_detail />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/user-manage',
        element: (
          <ErrorBoundary>
            <P_user_manage />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/sys-settings',
        element: (
          <ErrorBoundary>
            <P_sys_settings />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/profile',
        element: (
          <ErrorBoundary>
            <P_profile />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/sbom-upload',
        element: (
          <ErrorBoundary>
            <P_sbom_upload />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/kb-import',
        element: (
          <ErrorBoundary>
            <P_kb_import />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/kb-edit',
        element: (
          <ErrorBoundary>
            <P_kb_edit />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/kb-category',
        element: (
          <ErrorBoundary>
            <P_kb_category />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/report-generate',
        element: (
          <ErrorBoundary>
            <P_report_generate />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/user-edit',
        element: (
          <ErrorBoundary>
            <P_user_edit />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/role-manage',
        element: (
          <ErrorBoundary>
            <P_role_manage />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
