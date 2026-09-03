import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import HomePage from '@/components/pages/HomePage';
import RepositoriesPage from '@/components/pages/RepositoriesPage';
import RepositoryDetailsPage from '@/components/pages/RepositoryDetailsPage';
import PipelinesPage from '@/components/pages/PipelinesPage';
import PipelineDetailsPage from '@/components/pages/PipelineDetailsPage';
import FindingsPage from '@/components/pages/FindingsPage';
import FindingDetailsPage from '@/components/pages/FindingDetailsPage';
import ScansPage from '@/components/pages/ScansPage';
import ScanDetailsPage from '@/components/pages/ScanDetailsPage';
import ReportsPage from '@/components/pages/ReportsPage';
import SettingsPage from '@/components/pages/SettingsPage';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
        routeMetadata: {
          pageIdentifier: 'home',
        },
      },
      {
        path: "repositories",
        element: <RepositoriesPage />,
        routeMetadata: {
          pageIdentifier: 'repositories',
        },
      },
      {
        path: "repositories/:id",
        element: <RepositoryDetailsPage />,
        routeMetadata: {
          pageIdentifier: 'repository-details',
        },
      },
      {
        path: "pipelines",
        element: <PipelinesPage />,
        routeMetadata: {
          pageIdentifier: 'pipelines',
        },
      },
      {
        path: "pipelines/:id",
        element: <PipelineDetailsPage />,
        routeMetadata: {
          pageIdentifier: 'pipeline-details',
        },
      },
      {
        path: "findings",
        element: <FindingsPage />,
        routeMetadata: {
          pageIdentifier: 'findings',
        },
      },
      {
        path: "findings/:id",
        element: <FindingDetailsPage />,
        routeMetadata: {
          pageIdentifier: 'finding-details',
        },
      },
      {
        path: "scans",
        element: <ScansPage />,
        routeMetadata: {
          pageIdentifier: 'scans',
        },
      },
      {
        path: "scans/:id",
        element: <ScanDetailsPage />,
        routeMetadata: {
          pageIdentifier: 'scan-details',
        },
      },
      {
        path: "reports",
        element: <ReportsPage />,
        routeMetadata: {
          pageIdentifier: 'reports',
        },
      },
      {
        path: "settings",
        element: <SettingsPage />,
        routeMetadata: {
          pageIdentifier: 'settings',
        },
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
