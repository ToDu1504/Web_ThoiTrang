import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminSearchOrders, updateOrderStatus } from '../../api/admin/orders';
import { formatCurrency } from '../../lib/format';
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../../lib/orderStatus';
import type { OrderStatus } from '../../types/order';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'];

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => adminSearchOrders({ status: statusFilter === 'ALL' ? undefined : statusFilter, page: 0, size: 50 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-foreground">Đơn hàng</h1>

      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'ALL')}>
        <SelectTrigger className="mb-4 w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Người nhận</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Cập nhật</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {data?.content.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link to={`/orders/${order.id}`} className="font-medium text-foreground hover:underline">
                    {order.orderCode}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{order.receiverName}</TableCell>
                <TableCell className="text-muted-foreground">{formatCurrency(order.totalAmount)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={ORDER_STATUS_COLOR[order.status]}>
                    {ORDER_STATUS_LABEL[order.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                    onValueChange={(v) => statusMutation.mutate({ id: order.id, status: v as OrderStatus })}
                  >
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {ORDER_STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
