import { apiClient } from '../client';
import type { ApiResponse, PageResponse } from '../../types/common';
import type { ProductRequest, ProductResponse, ProductStatus } from '../../types/product';

export async function adminSearchProducts(params: {
  keyword?: string;
  categoryId?: number;
  brandId?: number;
  status?: ProductStatus;
  page?: number;
  size?: number;
}): Promise<PageResponse<ProductResponse>> {
  const { data } = await apiClient.get<ApiResponse<PageResponse<ProductResponse>>>('/api/admin/products', {
    params,
  });
  return data.data;
}

export async function createProduct(payload: ProductRequest): Promise<ProductResponse> {
  const { data } = await apiClient.post<ApiResponse<ProductResponse>>('/api/admin/products', payload);
  return data.data;
}

export async function updateProduct(id: number, payload: ProductRequest): Promise<ProductResponse> {
  const { data } = await apiClient.put<ApiResponse<ProductResponse>>(`/api/admin/products/${id}`, payload);
  return data.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/products/${id}`);
}

export async function uploadProductImage(
  productId: number,
  file: File,
  isThumbnail: boolean,
): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  await apiClient.post(`/api/admin/products/${productId}/images`, formData, {
    params: { isThumbnail },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deleteProductImage(productId: number, imageId: number): Promise<void> {
  await apiClient.delete(`/api/admin/products/${productId}/images/${imageId}`);
}
