import { Navigate, Route, Routes } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { UploadProvider } from './contexts/UploadContext';
import { LogProvider } from './contexts/LogContext';
import Layout from './components/layout/Layout';
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
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/uploads/:id" element={<UploadDetailPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </LogProvider>
      </UploadProvider>
    </NotificationProvider>
  );
}
