import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../../api/orders';
import { formatCurrency } from '../../lib/format';
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '../../lib/orderStatus';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <p className="text-gray-500">Đang tải...</p>;
  if (!order) return <p className="text-gray-500">Không tìm thấy đơn hàng.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Đơn hàng {order.orderCode}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="mt-6 rounded-md border border-gray-200 p-4">
        <h2 className="mb-2 font-medium text-gray-900">Thông tin giao hàng</h2>
        <p className="text-sm text-gray-600">{order.receiverName} · {order.receiverPhone}</p>
        <p className="text-sm text-gray-600">{order.shippingAddress}</p>
        <p className="mt-2 text-sm text-gray-600">
          Thanh toán: {order.paymentMethod} — {PAYMENT_STATUS_LABEL[order.paymentStatus]}
        </p>
      </div>

      <div className="mt-4 rounded-md border border-gray-200 p-4">
        <h2 className="mb-3 font-medium text-gray-900">Sản phẩm</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600">
              <span>
                {item.productName} ({item.size}/{item.color}) x{item.quantity}
              </span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Phí vận chuyển</span>
            <span>{formatCurrency(order.shippingFee)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Giảm giá {order.voucherCode ? `(${order.voucherCode})` : ''}</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold text-gray-900">
            <span>Tổng cộng</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
