import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyOrders } from '../../api/orders';
import { formatCurrency } from '../../lib/format';
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../../lib/orderStatus';

export function OrdersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: () => getMyOrders(0, 20) });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Đơn hàng của tôi</h1>

      {isLoading && <p className="text-gray-500">Đang tải...</p>}
      {data && data.content.length === 0 && <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>}

      <div className="space-y-3">
        {data?.content.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block rounded-md border border-gray-200 p-4 hover:border-brand-400"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{order.orderCode}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {order.items.length} sản phẩm · {new Date(order.createdAt).toLocaleDateString('vi-VN')}
            </p>
            <p className="mt-1 font-semibold text-brand-700">{formatCurrency(order.totalAmount)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
