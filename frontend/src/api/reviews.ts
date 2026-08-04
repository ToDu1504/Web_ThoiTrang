import { apiClient } from './client';
import type { ApiResponse, PageResponse } from '../types/common';
import type { ReviewRequest, ReviewResponse } from '../types/review';

export async function getProductReviews(productId: number, page = 0, size = 10): Promise<PageResponse<ReviewResponse>> {
  const { data } = await apiClient.get<ApiResponse<PageResponse<ReviewResponse>>>(
    `/api/products/${productId}/reviews`,
    { params: { page, size } },
  );
  return data.data;
}

export async function createReview(payload: ReviewRequest): Promise<ReviewResponse> {
  const { data } = await apiClient.post<ApiResponse<ReviewResponse>>('/api/reviews', payload);
  return data.data;
}
