import { isAxiosError } from 'axios';
import type { ApiResponse } from '../types/common';

export function getErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra, vui lòng thử lại'): string {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function getFieldErrors(error: unknown): Record<string, string> | null {
  if (isAxiosError<ApiResponse<Record<string, string>>>(error)) {
    const data = error.response?.data?.data;
    if (data && typeof data === 'object') {
      return data;
    }
  }
  return null;
}
