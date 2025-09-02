import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import ScamHub from '@/pages/ScamHub';
import ScamCheck from '@/pages/ScamCheck';
import AboutUs from '@/pages/AboutUs';
import Results from '@/pages/Results';
import NotFound from '@/pages/NotFound';
import { ProtectedRoute } from './protected';

const withSuspense = (element: React.ReactElement) => (
  <Suspense fallback={<LoadingSpinner />}>
    {element}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<RootLayout />),
    children: [
      { index: true, element: <ScamHub /> },
      { path: 'features', element: <ScamCheck /> },
      { path: 'about', element: <AboutUs /> },
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
  { path: '*', element: <NotFound /> }
]);


