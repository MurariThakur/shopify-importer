import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatsBar from '../components/dashboard/StatsBar';
import UploadTable from '../components/dashboard/UploadTable';
import { useUpload } from '../contexts/UploadContext';
import { useNotification } from '../contexts/NotificationContext';

export default function DashboardPage() {
  const {
    uploads, pagination, loading,
    fetchUploads, fetchStatus,
    setUploads, setPagination,
  } = useUpload();
  const { notify } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchUploads(currentPage);
    setCurrentPage(1);
  }, []);

  const processingIds = uploads
    .filter(u => u.status === 'pending' || u.status === 'processing' || (u.pending_count + u.processing_count > 0))
    .map(u => u.id);

  useEffect(() => {
    if (processingIds.length === 0) return;

    pollingRef.current = setInterval(async () => {
      const updates = {};

      for (const id of processingIds) {
        const fresh = await fetchStatus(id);
        if (!fresh) continue;

        updates[id] = fresh;

        if (fresh.status === 'completed' || fresh.status === 'failed') {
          notify(
            fresh.status === 'completed' ? 'success' : 'error',
            `Import ${fresh.status}.`
          );
        }
      }

      // Merge status updates into current uploads array
      setUploads(prev =>
        prev.map(u => {
          const update = updates[u.id];
          if (!update) return u;
          return { ...u, ...update };
        })
      );

      // If any finished, refresh the full list
      const hasFinished = Object.values(updates).some(
        u => u.status === 'completed' || u.status === 'failed'
      );
      if (hasFinished) {
        fetchUploads(currentPage);
      }
    }, 3000);

    return () => clearInterval(pollingRef.current);
  }, [processingIds.join(',')]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUploads(page);
  };

  const now = Date.now();
  const stuckUploads = uploads.filter(u => {
    if (u.status !== 'pending' && u.status !== 'processing') return false;
    const uploadedAt = new Date(u.uploaded_at).getTime();
    return (now - uploadedAt) > 5 * 60 * 1000;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <Link to="/upload">
          <Button variant="primary">New Upload</Button>
        </Link>
      </div>

      {stuckUploads.length > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-300">
            <span className="font-semibold">⚠</span> {stuckUploads.length} upload(s) have been pending for over 5 minutes. The queue worker may not be running.{' '}
            <code className="text-yellow-400 bg-yellow-950 px-1 rounded">php artisan queue:work</code>
          </p>
        </div>
      )}

      <StatsBar uploads={uploads} />

      <Card title="Uploads">
        <UploadTable
          uploads={uploads}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Card>
    </div>
  );
}
