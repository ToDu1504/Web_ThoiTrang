import { apiClient } from './client';
import type { ApiResponse } from '../types/common';
import type { BrandResponse } from '../types/product';

export async function getBrands(): Promise<BrandResponse[]> {
  const { data } = await apiClient.get<ApiResponse<BrandResponse[]>>('/api/brands');
  return data.data;
}
