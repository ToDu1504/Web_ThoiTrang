import { apiClient } from './client';
import type { ApiResponse } from '../types/common';
import type { AddCartItemRequest, CartResponse, UpdateCartItemRequest } from '../types/cart';

export async function getCart(): Promise<CartResponse> {
  const { data } = await apiClient.get<ApiResponse<CartResponse>>('/api/cart');
  return data.data;
}

export async function addCartItem(payload: AddCartItemRequest): Promise<CartResponse> {
  const { data } = await apiClient.post<ApiResponse<CartResponse>>('/api/cart/items', payload);
  return data.data;
}

export async function updateCartItem(id: number, payload: UpdateCartItemRequest): Promise<CartResponse> {
  const { data } = await apiClient.put<ApiResponse<CartResponse>>(`/api/cart/items/${id}`, payload);
  return data.data;
}

export async function removeCartItem(id: number): Promise<CartResponse> {
  const { data } = await apiClient.delete<ApiResponse<CartResponse>>(`/api/cart/items/${id}`);
  return data.data;
}
