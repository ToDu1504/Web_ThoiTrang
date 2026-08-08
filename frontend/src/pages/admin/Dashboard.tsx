import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import { getDashboardStats } from '../../api/admin/dashboard';
import { formatCurrency } from '../../lib/format';
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../../lib/orderStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

function StatCard({
  label,
  value,
  icon: Icon,
  index,
}: {
  label: string;
  value: string;
  icon: typeof DollarSign;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
          <Icon className="size-4 text-foreground" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </motion.div>
  );
}

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: getDashboardStats });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const maxSold = Math.max(...data.topSellingProducts.map((p) => p.totalSold), 1);

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-foreground">Thống kê tổng quan</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Tổng doanh thu" value={formatCurrency(data.totalRevenue)} icon={DollarSign} />
        <StatCard index={1} label="Doanh thu hôm nay" value={formatCurrency(data.revenueToday)} icon={DollarSign} />
        <StatCard index={2} label="Doanh thu tháng này" value={formatCurrency(data.revenueThisMonth)} icon={DollarSign} />
        <StatCard index={3} label="Tổng đơn hàng" value={String(data.totalOrders)} icon={ShoppingBag} />
        <StatCard index={4} label="Tổng người dùng" value={String(data.totalUsers)} icon={Users} />
        <StatCard index={5} label="Tổng sản phẩm" value={String(data.totalProducts)} icon={Package} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Đơn hàng theo trạng thái</h2>
          <div className="space-y-3">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <Badge variant="secondary" className={ORDER_STATUS_COLOR[status as keyof typeof ORDER_STATUS_LABEL]}>
                  {ORDER_STATUS_LABEL[status as keyof typeof ORDER_STATUS_LABEL]}
                </Badge>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Top sản phẩm bán chạy</h2>
          <div className="space-y-4">
            {data.topSellingProducts.length === 0 && <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>}
            {data.topSellingProducts.map((product) => (
              <div key={product.productId}>
                <div className="flex justify-between text-sm text-foreground">
                  <span className="truncate">{product.productName}</span>
                  <span className="shrink-0 text-muted-foreground">{product.totalSold}</span>
                </div>
                <Progress value={(product.totalSold / maxSold) * 100} className="mt-1.5 h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
