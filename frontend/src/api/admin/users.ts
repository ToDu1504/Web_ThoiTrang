import { apiClient } from '../client';
import type { ApiResponse, PageResponse } from '../../types/common';
import type { UserResponse, UserStatus } from '../../types/auth';

export async function adminSearchUsers(params: {
  keyword?: string;
  status?: UserStatus;
  page?: number;
  size?: number;
}): Promise<PageResponse<UserResponse>> {
  const { data } = await apiClient.get<ApiResponse<PageResponse<UserResponse>>>('/api/admin/users', {
    params,
  });
  return data.data;
}

export async function updateUserStatus(id: number, status: UserStatus): Promise<UserResponse> {
  const { data } = await apiClient.put<ApiResponse<UserResponse>>(`/api/admin/users/${id}/status`, { status });
  return data.data;
}

export async function updateUserRoles(id: number, roles: string[]): Promise<UserResponse> {
  const { data } = await apiClient.put<ApiResponse<UserResponse>>(`/api/admin/users/${id}/roles`, { roles });
  return data.data;
}
