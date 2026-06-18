export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page } = meta;
  const pages = [];

  for (let i = 1; i <= last_page; i++) {
    if (i === 1 || i === last_page || (i >= current_page - 1 && i <= current_page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPageChange(current_page - 1)}
        disabled={current_page <= 1}
        className="px-3 py-1 rounded text-sm text-gray-400 hover:text-gray-200 disabled:opacity-30 transition-colors"
      >
        &laquo;
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-500 text-sm">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              p === current_page
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(current_page + 1)}
        disabled={current_page >= last_page}
        className="px-3 py-1 rounded text-sm text-gray-400 hover:text-gray-200 disabled:opacity-30 transition-colors"
      >
        &raquo;
      </button>
    </div>
  );
}
