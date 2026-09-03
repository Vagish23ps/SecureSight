import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/components/ErrorPage';
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
      },
      {
        path: "repositories",
        element: <RepositoriesPage />,
      },
      {
        path: "repositories/:id",
        element: <RepositoryDetailsPage />,
      },
      {
        path: "pipelines",
        element: <PipelinesPage />,
      },
      {
        path: "pipelines/:id",
        element: <PipelineDetailsPage />,
      },
      {
        path: "findings",
        element: <FindingsPage />,
      },
      {
        path: "findings/:id",
        element: <FindingDetailsPage />,
      },
      {
        path: "scans",
        element: <ScansPage />,
      },
      {
        path: "scans/:id",
        element: <ScanDetailsPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
