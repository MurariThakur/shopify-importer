export default function EmptyState({ icon = '📁', title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
      {message && <p className="text-sm text-gray-500 mt-1">{message}</p>}
    </div>
  );
}
