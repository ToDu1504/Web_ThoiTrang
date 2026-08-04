export interface CartItemResponse {
  id: number;
  variantId: number;
  productId: number;
  productName: string;
  productSlug: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
  availableStock: number;
  thumbnailUrl: string | null;
}

export interface CartResponse {
  id: number;
  sessionId: string | null;
  items: CartItemResponse[];
  totalQuantity: number;
  totalAmount: number;
}

export interface AddCartItemRequest {
  variantId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
