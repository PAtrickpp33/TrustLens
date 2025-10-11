import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import Quiz from '@/pages/Quiz';
import ScamCheck from '@/pages/ScamCheck';
import AboutUs from '@/pages/AboutUs';
import Results from '@/pages/Results';
import NotFound from '@/pages/NotFound';
import Articles from '@/pages/Articles';
import ArticleDetail from '@/pages/ArticleDetail';
import { ArticlesLayout } from '@/layouts/ArticlesLayout';
import ArticlesEditor from '@/pages/ArticlesEditor';
import { ProtectedRoute, SiteGate } from './protected';

import LandingDashboard from '@/pages/LandingDashboard';
import LandingOverview from '@/pages/LandingOverview';


import ReportScam from '@/pages/ReportScam';
import ReportSuccess from '@/pages/ReportSuccess';

// import AdminReportsQueue from '@/pages/admin/AdminReportsQueue';

const withSuspense = (element: React.ReactElement) => (
  <Suspense fallback={<LoadingSpinner />}>
    {element}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(
      <SiteGate>
        <RootLayout />
      </SiteGate>
    ),
    children: [
      { index: true, element: <ScamCheck /> },

      //  this part for Epic 4
      { path: 'report', element: <ReportScam /> },
      { path: 'report/success', element: <ReportSuccess /> },

      { path: 'features', element: <Quiz /> }, // for epic 10
      { path: 'about', element: <AboutUs /> },
      { path: 'landing', element: <LandingDashboard /> },
      { path: 'overview', element: <LandingOverview /> },

      {
        path: 'articles',
        element: <ArticlesLayout />,
        children: [
          { index: true, element: <Articles /> },
          { path: ':slug', element: <ArticleDetail /> },
        ],
      },

      // Hidden editor route (no nav link)
      { path: 'hidden/articles-editor', element: <ArticlesEditor /> },

      {
        path: 'dashboard',
        element: withSuspense(
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: 'results', element: <Results /> },
        ],
      },

    
      // { path: 'admin/reports', element: <AdminReportsQueue /> },
    ],
  },
  {
    path: '*',
    element: (
      <SiteGate>
        <NotFound />
      </SiteGate>
    ),
  },
]);
