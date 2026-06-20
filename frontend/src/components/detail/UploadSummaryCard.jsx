import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import Card from '../ui/Card';

export default function UploadSummaryCard({ upload }) {
  if (!upload) return null;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-100">{upload.original_filename}</h2>
          <div className="flex items-center gap-3 mt-2">
            <Badge status={upload.status}>{upload.status}</Badge>
            <span className="text-xs text-gray-400">
              Uploaded: {new Date(upload.uploaded_at).toLocaleString()}
            </span>
            {upload.processed_at && (
              <span className="text-xs text-gray-400">
                Completed: {new Date(upload.processed_at).toLocaleString()}
              </span>
            )}
          </div>
          {upload.status === 'failed' && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-red-400">
                Import failed. Check the logs for details.
              </span>
              <Link
                to={`/logs?uploadId=${upload.id}`}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View logs &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        {[
          { label: 'Total Rows', value: upload.total_rows, color: 'text-gray-100' },
          { label: 'Pending', value: upload.pending_count, color: 'text-yellow-400' },
          { label: 'Processing', value: upload.processing_count, color: 'text-blue-400' },
          { label: 'Successful', value: upload.success_count, color: 'text-green-400' },
          { label: 'Failed', value: upload.failed_count, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 uppercase">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Progress</span>
          <span className="text-xs text-gray-400">{upload.progress_percentage}%</span>
        </div>
        <ProgressBar percentage={upload.progress_percentage} />
      </div>
    </Card>
  );
}
