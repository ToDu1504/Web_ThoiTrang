import { apiClient } from '../client';
import type { ApiResponse, PageResponse } from '../../types/common';
import type { OrderResponse, OrderStatus } from '../../types/order';

export async function adminSearchOrders(params: {
  status?: OrderStatus;
  page?: number;
  size?: number;
}): Promise<PageResponse<OrderResponse>> {
  const { data } = await apiClient.get<ApiResponse<PageResponse<OrderResponse>>>('/api/admin/orders', {
    params,
  });
  return data.data;
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<OrderResponse> {
  const { data } = await apiClient.put<ApiResponse<OrderResponse>>(`/api/admin/orders/${id}/status`, {
    status,
  });
  return data.data;
}
