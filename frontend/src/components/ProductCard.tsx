import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { ProductResponse } from '../types/product';
import { formatCurrency } from '../lib/format';
import { cn } from '@/lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ProductCardProps {
  product: ProductResponse;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const thumbnail = product.images.find((image) => image.isThumbnail) ?? product.images[0];
  const imageUrl = thumbnail ? `${API_BASE_URL}${thumbnail.imageUrl}` : null;
  const outOfStock = product.variants.length > 0 && product.variants.every((v) => v.stockQuantity <= 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('group', className)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Không có ảnh
            </div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
              <span className="rounded-full border border-foreground/20 bg-background px-3 py-1 text-xs font-medium tracking-wide">
                Hết hàng
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="mt-3 space-y-1">
          {product.brandName && (
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {product.brandName}
            </p>
          )}
          <h3 className="line-clamp-1 text-sm text-foreground">{product.name}</h3>
          <div className="flex items-center justify-between pt-0.5">
            <p className="text-sm font-semibold text-foreground">{formatCurrency(product.basePrice)}</p>
            {product.reviewCount > 0 && (
              <p className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Star className="size-3 fill-brand-500 text-brand-500" />
                {product.averageRating?.toFixed(1)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
