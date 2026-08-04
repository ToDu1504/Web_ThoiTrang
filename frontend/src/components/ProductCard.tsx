import { Link } from 'react-router-dom';
import type { ProductResponse } from '../types/product';
import { formatCurrency } from '../lib/format';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ProductCardProps {
  product: ProductResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const thumbnail = product.images.find((image) => image.isThumbnail) ?? product.images[0];
  const imageUrl = thumbnail ? `${API_BASE_URL}${thumbnail.imageUrl}` : null;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            Không có ảnh
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold text-brand-700">{formatCurrency(product.basePrice)}</p>
        {product.reviewCount > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            ★ {product.averageRating?.toFixed(1)} ({product.reviewCount})
          </p>
        )}
      </div>
    </Link>
  );
}
