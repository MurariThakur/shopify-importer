import Spinner from '../ui/Spinner';

export default function UploadProgress() {
  return (
    <div className="flex items-center justify-center gap-3 py-4 mt-4 bg-indigo-950/20 border border-indigo-800 rounded-lg">
      <Spinner size="sm" className="text-indigo-400" />
      <span className="text-sm text-indigo-300">Uploading...</span>
    </div>
  );
}
