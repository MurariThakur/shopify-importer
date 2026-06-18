export default function FilePreview({ file, onRemove }) {
  if (!file) return null;

  return (
    <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mt-4">
      <div className="flex items-center gap-3">
        <span className="text-green-400 text-lg">📄</span>
        <div>
          <p className="text-sm text-gray-200 font-medium">{file.name}</p>
          <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-gray-500 hover:text-red-400 transition-colors text-lg"
        title="Remove file"
      >
        &times;
      </button>
    </div>
  );
}
