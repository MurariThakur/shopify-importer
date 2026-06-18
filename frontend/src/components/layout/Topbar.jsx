import { useLocation } from 'react-router-dom';

const titles = {
  '/upload': 'Upload CSV',
  '/dashboard': 'Dashboard',
  '/logs': 'Logs',
};

export default function Topbar() {
  const location = useLocation();
  const base = location.pathname.split('/')[1];
  const title = titles[`/${base}`] || (location.pathname.startsWith('/uploads/') ? 'Upload Details' : 'Shopify Importer');

  return (
    <header className="h-14 border-b border-gray-800 flex items-center px-6 bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
    </header>
  );
}
