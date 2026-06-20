import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import LevelFilter from '../components/logs/LevelFilter';
import LogTable from '../components/logs/LogTable';
import { useLogs } from '../contexts/LogContext';

export default function LogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const uploadId = searchParams.get('uploadId');
  const {
    logs, pagination, loading,
    fetchLogs, fetchUploadLogs, setFilter, clearFilters,
  } = useLogs();
  const [levelFilter, setLevelFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadLogs = useCallback((page = 1) => {
    if (uploadId) {
      fetchUploadLogs(uploadId, { level: levelFilter, page });
    } else {
      fetchLogs({ level: levelFilter, page });
    }
  }, [uploadId, levelFilter, fetchLogs, fetchUploadLogs]);

  useEffect(() => {
    loadLogs(1);
    setCurrentPage(1);
  }, [uploadId, levelFilter]);

  const handleLevelChange = (level) => {
    setLevelFilter(level);
    setFilter('level', level);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadLogs(page);
  };

  const handleClearUploadFilter = () => {
    clearFilters();
    setSearchParams({});
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            {uploadId ? `Logs for Upload #${uploadId}` : 'Logs'}
          </h1>
          {uploadId && (
            <button
              onClick={handleClearUploadFilter}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors mt-1"
            >
              &larr; Show All Logs
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {uploadId && (
            <Link to={`/uploads/${uploadId}`}>
              <span className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                View Upload
              </span>
            </Link>
          )}
          <LevelFilter active={levelFilter} onChange={handleLevelChange} />
        </div>
      </div>

      <Card>
        <LogTable
          logs={logs}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Card>
    </div>
  );
}
