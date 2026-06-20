import { Navigate, Route, Routes } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { UploadProvider } from './contexts/UploadContext';
import { LogProvider } from './contexts/LogContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import UploadDetailPage from './pages/UploadDetailPage';
import LogsPage from './pages/LogsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <NotificationProvider>
      <UploadProvider>
        <LogProvider>
          <ErrorBoundary>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/upload" element={<ErrorBoundary><UploadPage /></ErrorBoundary>} />
                <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                <Route path="/uploads/:id" element={<ErrorBoundary><UploadDetailPage /></ErrorBoundary>} />
                <Route path="/logs" element={<ErrorBoundary><LogsPage /></ErrorBoundary>} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </LogProvider>
      </UploadProvider>
    </NotificationProvider>
  );
}
