import { useLocation } from 'react-router-dom';

const titles = {
  '/upload': 'Upload CSV',
  '/dashboard': 'Dashboard',
  '/logs': 'Logs',
};

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const base = location.pathname.split('/')[1];
  const title = titles[`/${base}`] || (location.pathname.startsWith('/uploads/') ? 'Upload Details' : 'Shopify Importer');

  return (
    <header className="h-14 border-b border-gray-800 flex items-center px-4 md:px-6 bg-gray-900">
      <button
        onClick={onMenuClick}
        className="md:hidden mr-3 text-gray-400 hover:text-gray-100 text-xl p-1"
        aria-label="Open menu"
      >
        ☰
      </button>
      <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
    </header>
  );
}
