const tabs = [
  { label: 'All', status: '' },
  { label: 'Pending', status: 'pending' },
  { label: 'Processing', status: 'processing' },
  { label: 'Successful', status: 'successful' },
  { label: 'Failed', status: 'failed' },
];

export default function StatusFilter({ active, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
      {tabs.map(tab => (
        <button
          key={tab.status}
          onClick={() => onChange(tab.status)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-150 ${
            active === tab.status
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
