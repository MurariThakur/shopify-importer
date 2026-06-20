import UploadRow from './UploadRow';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import Pagination from '../ui/Pagination';

export default function UploadTable({ uploads, loading, pagination, onPageChange }) {
  if (loading && uploads.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-indigo-400" />
      </div>
    );
  }

  if (!loading && uploads.length === 0) {
    return (
      <EmptyState
        icon="📁"
        title="No uploads yet"
        message="Upload a CSV file to get started."
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">File</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Uploaded</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Rows</th>
              <th className="py-3 px-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Success</th>
              <th className="py-3 px-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Failed</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Progress</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map(upload => (
              <UploadRow key={upload.id} upload={upload} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination meta={pagination} onPageChange={onPageChange} />
    </div>
  );
}
