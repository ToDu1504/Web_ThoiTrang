import { apiClient } from './client';
import type { ApiResponse, PageResponse } from '../types/common';
import type { CreateOrderRequest, OrderResponse } from '../types/order';

export async function checkout(payload: CreateOrderRequest): Promise<OrderResponse> {
  const { data } = await apiClient.post<ApiResponse<OrderResponse>>('/api/orders', payload);
  return data.data;
}

export async function getMyOrders(page = 0, size = 10): Promise<PageResponse<OrderResponse>> {
  const { data } = await apiClient.get<ApiResponse<PageResponse<OrderResponse>>>('/api/orders/my-orders', {
    params: { page, size },
  });
  return data.data;
}

export async function getOrderById(id: number): Promise<OrderResponse> {
  const { data } = await apiClient.get<ApiResponse<OrderResponse>>(`/api/orders/${id}`);
  return data.data;
}
