export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parentName: string | null;
}

export interface CategoryRequest {
  name: string;
  slug?: string;
  parentId?: number | null;
}

export interface BrandResponse {
  id: number;
  name: string;
  logoUrl: string | null;
}

export interface BrandRequest {
  name: string;
  logoUrl?: string;
}

export interface ProductVariantResponse {
  id: number;
  size: string;
  color: string;
  sku: string;
  price: number;
  stockQuantity: number;
}

export interface ProductVariantRequest {
  size: string;
  color: string;
  sku: string;
  price?: number;
  stockQuantity: number;
}

export interface ProductImageResponse {
  id: number;
  imageUrl: string;
  isThumbnail: boolean;
}

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number | null;
  categoryName: string | null;
  brandId: number | null;
  brandName: string | null;
  basePrice: number;
  status: ProductStatus;
  createdAt: string;
  variants: ProductVariantResponse[];
  images: ProductImageResponse[];
  averageRating: number | null;
  reviewCount: number;
}

export interface ProductRequest {
  name: string;
  slug?: string;
  description?: string;
  categoryId: number;
  brandId?: number;
  basePrice: number;
  status?: ProductStatus;
  variants?: ProductVariantRequest[];
}

export interface ProductSearchParams {
  keyword?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}
