import { apiClient } from './client';
import type { ApiResponse, PageResponse } from '../types/common';
import type { ProductResponse, ProductSearchParams } from '../types/product';

export async function searchProducts(params: ProductSearchParams): Promise<PageResponse<ProductResponse>> {
  const { data } = await apiClient.get<ApiResponse<PageResponse<ProductResponse>>>('/api/products', {
    params,
  });
  return data.data;
}

export async function getProductBySlug(slug: string): Promise<ProductResponse> {
  const { data } = await apiClient.get<ApiResponse<ProductResponse>>(`/api/products/${slug}`);
  return data.data;
}
