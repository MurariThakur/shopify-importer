const statusColors = {
  pending: 'bg-gray-700 text-gray-300',
  processing: 'bg-blue-900 text-blue-300',
  successful: 'bg-green-900 text-green-300',
  completed: 'bg-green-900 text-green-300',
  failed: 'bg-red-900 text-red-300',
};

const levelColors = {
  debug: 'bg-gray-700 text-gray-300',
  info: 'bg-blue-900 text-blue-300',
  warning: 'bg-yellow-900 text-yellow-300',
  error: 'bg-red-900 text-red-300',
};

export default function Badge({ status, level, children }) {
  const colorClass = status ? statusColors[status] : levelColors[level];
  const label = children || status || level;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass || 'bg-gray-700 text-gray-300'}`}>
      {label}
    </span>
  );
}
