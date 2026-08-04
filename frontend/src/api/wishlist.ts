import { apiClient } from './client';
import type { ApiResponse } from '../types/common';
import type { WishlistResponse } from '../types/wishlist';

export async function getWishlist(): Promise<WishlistResponse[]> {
  const { data } = await apiClient.get<ApiResponse<WishlistResponse[]>>('/api/wishlist');
  return data.data;
}

export async function addWishlist(productId: number): Promise<WishlistResponse> {
  const { data } = await apiClient.post<ApiResponse<WishlistResponse>>('/api/wishlist', { productId });
  return data.data;
}

export async function removeWishlist(productId: number): Promise<void> {
  await apiClient.delete(`/api/wishlist/${productId}`);
}
