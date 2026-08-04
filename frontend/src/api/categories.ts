import { apiClient } from './client';
import type { ApiResponse } from '../types/common';
import type { CategoryResponse } from '../types/product';

export async function getCategories(): Promise<CategoryResponse[]> {
  const { data } = await apiClient.get<ApiResponse<CategoryResponse[]>>('/api/categories');
  return data.data;
}
