export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'MOMO' | 'VNPAY' | 'BANK_TRANSFER';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED';

export interface OrderItemResponse {
  id: number;
  variantId: number;
  productId: number;
  productName: string;
  size: string;
  color: string;
  sku: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  orderCode: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  discountAmount: number;
  voucherCode: string | null;
  shippingFee: number;
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  createdAt: string;
  items: OrderItemResponse[];
  paymentUrl: string | null;
}

export interface CreateOrderRequest {
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  paymentMethod?: PaymentMethod;
  voucherCode?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
