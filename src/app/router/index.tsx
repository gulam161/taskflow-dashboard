import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { RouteLoader } from '@/components/ui/RouteLoader';

// Route-level code splitting using React.lazy
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const TasksPage = lazy(() => import('@/features/tasks/pages/TasksPage'));
const BoardPage = lazy(() => import('@/features/board/pages/BoardPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage'));
const NotFoundPage = lazy(() => import('@/features/common/pages/NotFoundPage'));

export const router = createBrowserRouter([
  // Public Routes (Login)
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },

  // Protected Routes (App Shell)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/dashboard',
            element: (
              <Suspense fallback={<RouteLoader />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/tasks',
            element: (
              <Suspense fallback={<RouteLoader />}>
                <TasksPage />
              </Suspense>
            ),
          },
          {
            path: '/board',
            element: (
              <Suspense fallback={<RouteLoader />}>
                <BoardPage />
              </Suspense>
            ),
          },
          {
            path: '/analytics',
            element: (
              <Suspense fallback={<RouteLoader />}>
                <AnalyticsPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // Root redirect
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // 404 Catch-all
  {
    path: '*',
    element: (
      <Suspense fallback={<RouteLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);
