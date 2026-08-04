export type DiscountType = 'PERCENT' | 'FIXED';

export interface VoucherResponse {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usedCount: number;
}

export interface VoucherRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
}
