import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { getOrderById } from '../../api/orders';
import { formatCurrency } from '../../lib/format';
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '../../lib/orderStatus';
import type { OrderStatus } from '../../types/order';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const STEPS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED'];

function OrderStepper({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Đơn hàng đã bị hủy
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <div key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full border-2 text-xs font-medium',
                i <= currentIndex ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground',
              )}
            >
              {i < currentIndex ? <Check className="size-4" /> : i + 1}
            </div>
            <span className={cn('whitespace-nowrap text-[11px]', i <= currentIndex ? 'text-foreground' : 'text-muted-foreground')}>
              {ORDER_STATUS_LABEL[step]}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('mx-2 h-0.5 flex-1', i < currentIndex ? 'bg-foreground' : 'bg-border')} />
          )}
        </div>
      ))}
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }
  if (!order) return <p className="text-muted-foreground">Không tìm thấy đơn hàng.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-foreground">Đơn hàng {order.orderCode}</h1>
        <Badge variant="secondary" className={ORDER_STATUS_COLOR[order.status]}>
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}
      </p>

      <div className="mt-8 rounded-xl border border-border p-5">
        <OrderStepper status={order.status} />
      </div>

      <div className="mt-4 rounded-xl border border-border p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Thông tin giao hàng</h2>
        <p className="text-sm text-muted-foreground">
          {order.receiverName} · {order.receiverPhone}
        </p>
        <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanh toán: {order.paymentMethod} — {PAYMENT_STATUS_LABEL[order.paymentStatus]}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-border p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Sản phẩm</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.productName} <span className="text-muted-foreground/70">({item.size}/{item.color}) x{item.quantity}</span>
              </span>
              <span className="shrink-0 font-medium text-foreground">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Phí vận chuyển</span>
            <span>{formatCurrency(order.shippingFee)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Giảm giá {order.voucherCode ? `(${order.voucherCode})` : ''}</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-base font-semibold text-foreground">
            <span>Tổng cộng</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
