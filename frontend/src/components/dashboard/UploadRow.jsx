import { Link } from 'react-router-dom';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';

export default function UploadRow({ upload }) {
  const date = new Date(upload.uploaded_at).toLocaleString();
  const isPending = upload.status === 'pending';

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
      <td className="py-3 px-4 text-sm text-gray-200 font-medium max-w-[200px] truncate">
        <Link to={`/uploads/${upload.id}`} className="hover:text-indigo-400 transition-colors">
          {upload.original_filename}
        </Link>
      </td>
      <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{date}</td>
      <td className="py-3 px-4">
        {isPending ? (
          <div className="flex items-center gap-2">
            <Spinner size="sm" className="text-gray-400" />
            <span className="text-xs text-gray-400">Waiting for queue&hellip;</span>
          </div>
        ) : (
          <Badge status={upload.status}>{upload.status}</Badge>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-gray-300 text-center">{upload.total_rows}</td>
      <td className="py-3 px-4 text-sm text-green-400 text-center">{upload.success_count}</td>
      <td className="py-3 px-4 text-sm text-red-400 text-center">{upload.failed_count}</td>
      <td className="py-3 px-4 min-w-[120px]">
        <div className="flex items-center gap-2">
          <ProgressBar percentage={upload.progress_percentage} className="flex-1" />
          <span className="text-xs text-gray-400 w-8 text-right">{upload.progress_percentage}%</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Link
            to={`/uploads/${upload.id}`}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View
          </Link>
          {upload.status === 'failed' && (
            <Link
              to={`/logs?uploadId=${upload.id}`}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Logs
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}
