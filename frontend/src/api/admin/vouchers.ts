import { apiClient } from '../client';
import type { ApiResponse } from '../../types/common';
import type { VoucherRequest, VoucherResponse } from '../../types/voucher';

export async function getVouchers(): Promise<VoucherResponse[]> {
  const { data } = await apiClient.get<ApiResponse<VoucherResponse[]>>('/api/admin/vouchers');
  return data.data;
}

export async function createVoucher(payload: VoucherRequest): Promise<VoucherResponse> {
  const { data } = await apiClient.post<ApiResponse<VoucherResponse>>('/api/admin/vouchers', payload);
  return data.data;
}

export async function updateVoucher(id: number, payload: VoucherRequest): Promise<VoucherResponse> {
  const { data } = await apiClient.put<ApiResponse<VoucherResponse>>(`/api/admin/vouchers/${id}`, payload);
  return data.data;
}

export async function deleteVoucher(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/vouchers/${id}`);
}
