import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/upload', label: 'Upload', icon: '↑' },
  { to: '/dashboard', label: 'Dashboard', icon: '☰' },
  { to: '/logs', label: 'Logs', icon: '📋' },
];

export default function Sidebar({ open, onClose }) {
  const sidebarContent = (
    <div className="w-64 bg-gray-900 border-r border-gray-800 h-full flex flex-col">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-lg font-bold text-indigo-500">Shopify Importer</h1>
        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-gray-100 text-xl"
        >
          &times;
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex md:flex-shrink-0 h-full">
        {sidebarContent}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative z-50 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
