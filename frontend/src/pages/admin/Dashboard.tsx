import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../api/admin/dashboard';
import { formatCurrency } from '../../lib/format';
import { ORDER_STATUS_LABEL } from '../../lib/orderStatus';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: getDashboardStats });

  if (isLoading || !data) return <p className="text-gray-500">Đang tải thống kê...</p>;

  const maxSold = Math.max(...data.topSellingProducts.map((p) => p.totalSold), 1);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Thống kê tổng quan</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Tổng doanh thu" value={formatCurrency(data.totalRevenue)} />
        <StatCard label="Doanh thu hôm nay" value={formatCurrency(data.revenueToday)} />
        <StatCard label="Doanh thu tháng này" value={formatCurrency(data.revenueThisMonth)} />
        <StatCard label="Tổng đơn hàng" value={String(data.totalOrders)} />
        <StatCard label="Tổng người dùng" value={String(data.totalUsers)} />
        <StatCard label="Tổng sản phẩm" value={String(data.totalProducts)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 font-medium text-gray-900">Đơn hàng theo trạng thái</h2>
          <div className="space-y-2">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{ORDER_STATUS_LABEL[status as keyof typeof ORDER_STATUS_LABEL]}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 font-medium text-gray-900">Top sản phẩm bán chạy</h2>
          <div className="space-y-3">
            {data.topSellingProducts.length === 0 && <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>}
            {data.topSellingProducts.map((product) => (
              <div key={product.productId}>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>{product.productName}</span>
                  <span>{product.totalSold}</span>
                </div>
                <div className="mt-1 h-2 rounded bg-gray-100">
                  <div
                    className="h-2 rounded bg-brand-500"
                    style={{ width: `${(product.totalSold / maxSold) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
