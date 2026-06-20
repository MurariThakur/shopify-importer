import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

export default function ProductRow({ product, uploadId }) {
  let shopifyUrl = null;
  if (product.shopify_product_id) {
    const match = product.shopify_product_id.match(/\d+$/);
    if (match) {
      shopifyUrl = `https://laravel-import-test.myshopify.com/admin/products/${match[0]}`;
    }
  }

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
      <td className="py-3 px-4 text-xs text-gray-500">{product.row_number}</td>
      <td className="py-3 px-4 text-sm text-gray-300 max-w-[150px] truncate">{product.handle || '—'}</td>
      <td className="py-3 px-4 text-sm text-gray-200 max-w-[200px] truncate">{product.title || '—'}</td>
      <td className="py-3 px-4">
        <Badge status={product.status}>{product.status}</Badge>
      </td>
      <td className="py-3 px-4">
        {product.status === 'failed' ? (
          <Link
            to={`/logs?uploadId=${uploadId}`}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            View logs
          </Link>
        ) : (
          <span className="text-xs text-gray-500">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        {shopifyUrl ? (
          <a
            href={shopifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            title="Open in Shopify Admin"
          >
            ↗ Open
          </a>
        ) : (
          <span className="text-xs text-gray-600">—</span>
        )}
      </td>
    </tr>
  );
}
