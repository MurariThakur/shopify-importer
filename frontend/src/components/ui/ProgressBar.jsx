export default function ProgressBar({ percentage = 0, className = '' }) {
  const pct = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`w-full bg-gray-800 rounded-full h-2 ${className}`}>
      <div
        className="bg-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
