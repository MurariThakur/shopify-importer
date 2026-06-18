export default function Toast({ id, type, message, onDismiss }) {
  const bgMap = {
    success: 'bg-green-900 border-green-700',
    error: 'bg-red-900 border-red-700',
    warning: 'bg-yellow-900 border-yellow-700',
    info: 'bg-blue-900 border-blue-700',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgMap[type] || bgMap.info} animate-slide-in`}>
      <span className="text-sm">{iconMap[type] || 'ℹ'}</span>
      <span className="text-sm text-gray-100 flex-1">{message}</span>
      <button onClick={() => onDismiss(id)} className="text-gray-400 hover:text-gray-100 ml-2">&times;</button>
    </div>
  );
}
