import Card from '../ui/Card';

export default function StatsBar({ uploads }) {
  const totalUploads = uploads.length;
  const totalProducts = uploads.reduce((sum, u) => sum + (u.total_rows || 0), 0);
  const totalSuccess = uploads.reduce((sum, u) => sum + (u.success_count || 0), 0);
  const totalFailed = uploads.reduce((sum, u) => sum + (u.failed_count || 0), 0);

  const stats = [
    { label: 'Total Uploads', value: totalUploads, color: 'text-indigo-400' },
    { label: 'Total Products', value: totalProducts, color: 'text-gray-100' },
    { label: 'Successful', value: totalSuccess, color: 'text-green-400' },
    { label: 'Failed', value: totalFailed, color: 'text-red-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map(s => (
        <Card key={s.label}>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
          <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
        </Card>
      ))}
    </div>
  );
}
