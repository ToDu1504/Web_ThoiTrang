import { apiClient } from '../client';
import type { ApiResponse } from '../../types/common';
import type { DashboardStatsResponse } from '../../types/admin';

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const { data } = await apiClient.get<ApiResponse<DashboardStatsResponse>>('/api/admin/dashboard/stats');
  return data.data;
}
