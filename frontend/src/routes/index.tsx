import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Home from '@/pages/Home';
import Features from '@/pages/Features';
import About from '@/pages/About';
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
      { index: true, element: <Home /> },
      { path: 'features', element: <Features /> },
      { path: 'about', element: <About /> },
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


