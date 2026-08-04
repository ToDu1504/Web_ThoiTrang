import { apiClient } from '../client';
import type { ApiResponse } from '../../types/common';
import type { BrandRequest, BrandResponse } from '../../types/product';

export async function createBrand(payload: BrandRequest): Promise<BrandResponse> {
  const { data } = await apiClient.post<ApiResponse<BrandResponse>>('/api/admin/brands', payload);
  return data.data;
}

export async function updateBrand(id: number, payload: BrandRequest): Promise<BrandResponse> {
  const { data } = await apiClient.put<ApiResponse<BrandResponse>>(`/api/admin/brands/${id}`, payload);
  return data.data;
}

export async function deleteBrand(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/brands/${id}`);
}
