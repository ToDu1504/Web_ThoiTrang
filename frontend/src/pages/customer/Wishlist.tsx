import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import { getWishlist, removeWishlist } from '../../api/wishlist';
import { formatCurrency } from '../../lib/format';
import { Skeleton } from '@/components/ui/skeleton';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function WishlistPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: getWishlist });
  const removeMutation = useMutation({
    mutationFn: (productId: number) => removeWishlist(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-semibold text-foreground sm:text-3xl">Danh sách yêu thích</h1>

      {isLoading && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-3/4 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {data && data.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
            <Heart className="size-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-muted-foreground">Chưa có sản phẩm yêu thích nào.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {data?.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="group"
          >
            <Link to={`/products/${item.productSlug}`} className="relative block aspect-3/4 overflow-hidden rounded-lg bg-muted">
              {item.thumbnailUrl && (
                <img
                  src={`${API_BASE_URL}${item.thumbnailUrl}`}
                  alt={item.productName}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeMutation.mutate(item.productId);
                }}
                aria-label="Xóa khỏi yêu thích"
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground backdrop-blur-sm transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </Link>
            <div className="mt-3">
              <Link to={`/products/${item.productSlug}`} className="line-clamp-1 text-sm text-foreground">
                {item.productName}
              </Link>
              <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(item.basePrice)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
