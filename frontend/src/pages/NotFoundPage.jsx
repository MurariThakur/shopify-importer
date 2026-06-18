import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-6xl font-bold text-gray-700">404</h1>
      <p className="text-gray-400 mt-4">Page not found</p>
      <Link to="/dashboard" className="mt-6 text-indigo-500 hover:text-indigo-400 transition-colors">
        &larr; Back to Dashboard
      </Link>
    </div>
  );
}
