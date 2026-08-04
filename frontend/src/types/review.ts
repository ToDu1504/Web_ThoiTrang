export interface ReviewResponse {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ReviewRequest {
  productId: number;
  rating: number;
  comment?: string;
}
