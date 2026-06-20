import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import UploadSummaryCard from '../components/detail/UploadSummaryCard';
import StatusFilter from '../components/detail/StatusFilter';
import ProductTable from '../components/detail/ProductTable';
import { useUpload } from '../contexts/UploadContext';
import { useNotification } from '../contexts/NotificationContext';

export default function UploadDetailPage() {
  const { id } = useParams();
  const {
    currentUpload, setCurrentUpload,
    products, productPagination, loading,
    fetchUpload, fetchStatus, fetchProducts,
  } = useUpload();
  const { notify } = useNotification();
  const [filterStatus, setFilterStatus] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [initialLoad, setInitialLoad] = useState(true);
  const pollingRef = useRef(null);
  const prevCountsRef = useRef(null);

  useEffect(() => {
    (async () => {
      setInitialLoad(true);
      const upload = await fetchUpload(id);
      await fetchProducts(id, { page: 1 });
      setInitialLoad(false);
      if (upload?.status !== 'pending' && upload?.status !== 'processing') {
        prevCountsRef.current = {
          pending: upload?.pending_count,
          processing: upload?.processing_count,
          success: upload?.success_count,
          failed: upload?.failed_count,
        };
      }
    })();
    return () => clearInterval(pollingRef.current);
  }, [id]);

  const shouldPoll = currentUpload &&
    (currentUpload.status === 'processing' || currentUpload.status === 'pending' ||
     ((currentUpload.pending_count ?? 0) + (currentUpload.processing_count ?? 0) > 0));

  useEffect(() => {
    if (!shouldPoll) return;

    pollingRef.current = setInterval(async () => {
      const fresh = await fetchStatus(id);
      if (!fresh) return;

      setCurrentUpload(prev => prev ? { ...prev, ...fresh } : prev);

      const isDone = fresh.status === 'completed' || fresh.status === 'failed';
      const hasChanges = !prevCountsRef.current ||
        fresh.pending_count !== prevCountsRef.current.pending ||
        fresh.processing_count !== prevCountsRef.current.processing ||
        fresh.success_count !== prevCountsRef.current.success ||
        fresh.failed_count !== prevCountsRef.current.failed;

      prevCountsRef.current = {
        pending: fresh.pending_count,
        processing: fresh.processing_count,
        success: fresh.success_count,
        failed: fresh.failed_count,
      };

      if (isDone || hasChanges) {
        fetchProducts(id, { page: 1 });
        setProductPage(1);
      }

      if (isDone) {
        clearInterval(pollingRef.current);
        notify(
          fresh.status === 'completed' ? 'success' : 'error',
          `Import ${fresh.status}.`
        );
        fetchUpload(id);
      }
    }, 3000);

    return () => clearInterval(pollingRef.current);
  }, [id, shouldPoll]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setProductPage(1);
    fetchProducts(id, { status, page: 1 });
  };

  const handleProductPageChange = (page) => {
    setProductPage(page);
    fetchProducts(id, { status: filterStatus, page });
  };

  const showProcessingMsg = initialLoad ||
    (currentUpload && (currentUpload.status === 'pending' || currentUpload.status === 'processing')
     && products.length === 0);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-200 transition-colors">
          &larr; Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-100">Upload Details</h1>
        <div className="ml-auto">
          <Link to={`/logs?uploadId=${id}`}>
            <Button variant="secondary" size="sm">View Logs</Button>
          </Link>
        </div>
      </div>

      {initialLoad ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Spinner size="lg" className="text-indigo-400" />
          <p className="text-sm text-gray-400">Loading upload details...</p>
        </div>
      ) : (
        <>
          <UploadSummaryCard upload={currentUpload} />

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <StatusFilter active={filterStatus} onChange={handleFilterChange} />
            </div>
            {showProcessingMsg ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 bg-gray-900 border border-gray-800 rounded-lg">
                <Spinner size="md" className="text-indigo-400" />
                <p className="text-sm text-gray-400">
                  {currentUpload?.status === 'pending'
                    ? 'Processing CSV...'
                    : "Processing CSV — products will appear here as they're created..."}
                </p>
              </div>
            ) : (
              <ProductTable
                products={products}
                loading={loading}
                pagination={productPagination}
                onPageChange={handleProductPageChange}
                uploadId={id}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
