import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, PackageOpen } from 'lucide-react';
import { getMyOrders } from '../../api/orders';
import { formatCurrency } from '../../lib/format';
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../../lib/orderStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function OrdersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: () => getMyOrders(0, 20) });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display mb-8 text-2xl font-semibold text-foreground sm:text-3xl">Đơn hàng của tôi</h1>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {data && data.content.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
            <PackageOpen className="size-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
        </div>
      )}

      <div className="space-y-3">
        {data?.content.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Link
              to={`/orders/${order.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-border p-5 transition-colors hover:border-foreground"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-medium text-foreground">{order.orderCode}</span>
                  <Badge variant="secondary" className={ORDER_STATUS_COLOR[order.status]}>
                    {ORDER_STATUS_LABEL[order.status]}
                  </Badge>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {order.items.length} sản phẩm · {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </p>
                <p className="mt-1 font-semibold text-foreground">{formatCurrency(order.totalAmount)}</p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
