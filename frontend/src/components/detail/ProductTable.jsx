import ProductRow from './ProductRow';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import Pagination from '../ui/Pagination';

export default function ProductTable({ products, loading, pagination, onPageChange, uploadId }) {
  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-indigo-400" />
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="No products found"
        message="No products match the current filter."
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Handle</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Error</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Shopify</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <ProductRow key={product.id} product={product} uploadId={uploadId} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination meta={pagination} onPageChange={onPageChange} />
    </div>
  );
}
