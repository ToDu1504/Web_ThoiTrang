export interface WishlistResponse {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  basePrice: number;
  thumbnailUrl: string | null;
}

export interface AddWishlistRequest {
  productId: number;
}
