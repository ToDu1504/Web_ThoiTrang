import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminSearchOrders, updateOrderStatus } from '../../api/admin/orders';
import { formatCurrency } from '../../lib/format';
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../../lib/orderStatus';
import type { OrderStatus } from '../../types/order';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'];

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => adminSearchOrders({ status: statusFilter || undefined, page: 0, size: 50 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Đơn hàng</h1>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
        className="mb-4 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
      >
        <option value="">Tất cả trạng thái</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABEL[s]}
          </option>
        ))}
      </select>

      {isLoading && <p className="text-gray-500">Đang tải...</p>}

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2">Mã đơn</th>
            <th className="py-2">Người nhận</th>
            <th className="py-2">Tổng tiền</th>
            <th className="py-2">Trạng thái</th>
            <th className="py-2">Cập nhật</th>
          </tr>
        </thead>
        <tbody>
          {data?.content.map((order) => (
            <tr key={order.id} className="border-b border-gray-100">
              <td className="py-2">
                <Link to={`/orders/${order.id}`} className="text-brand-600 hover:underline">
                  {order.orderCode}
                </Link>
              </td>
              <td className="py-2">{order.receiverName}</td>
              <td className="py-2">{formatCurrency(order.totalAmount)}</td>
              <td className="py-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </td>
              <td className="py-2">
                <select
                  value={order.status}
                  disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                  onChange={(e) => statusMutation.mutate({ id: order.id, status: e.target.value as OrderStatus })}
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs disabled:opacity-50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
