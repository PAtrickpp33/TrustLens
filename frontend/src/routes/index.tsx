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
      { path: 'features', element: <Quiz /> },
      { path: 'about', element: <AboutUs /> },
      {
        path: 'articles',
        element: <ArticlesLayout />,
        children: [
          { index: true, element: <Articles /> },
          { path: ':slug', element: <ArticleDetail /> }
        ]
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
          { path: 'results', element: <Results /> }
        ]
      }
    ]
  },
  { path: '*', element: (
    <SiteGate>
      <NotFound />
    </SiteGate>
  ) }
]);


