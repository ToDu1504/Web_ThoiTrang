import { apiClient } from '../client';
import type { ApiResponse } from '../../types/common';
import type { CategoryRequest, CategoryResponse } from '../../types/product';

export async function createCategory(payload: CategoryRequest): Promise<CategoryResponse> {
  const { data } = await apiClient.post<ApiResponse<CategoryResponse>>('/api/admin/categories', payload);
  return data.data;
}

export async function updateCategory(id: number, payload: CategoryRequest): Promise<CategoryResponse> {
  const { data } = await apiClient.put<ApiResponse<CategoryResponse>>(`/api/admin/categories/${id}`, payload);
  return data.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/categories/${id}`);
}
