import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Minus, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import { getProductBySlug } from '../../api/products';
import { getProductReviews, createReview } from '../../api/reviews';
import { addWishlist } from '../../api/wishlist';
import { useAddCartItem } from '../../hooks/useCart';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../lib/format';
import { getErrorMessage } from '../../lib/errors';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < Math.round(value) ? 'fill-brand-500 text-brand-500' : 'text-muted-foreground/30'}
        />
      ))}
    </span>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => getProductReviews(product!.id),
    enabled: !!product,
  });

  const addCartMutation = useAddCartItem();
  const wishlistMutation = useMutation({ mutationFn: () => addWishlist(product!.id) });
  const reviewMutation = useMutation({
    mutationFn: () => createReview({ productId: product!.id, rating, comment: comment || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', product?.id] });
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
      setComment('');
      toast.success('Cảm ơn bạn đã đánh giá!');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const colors = useMemo(
    () => (product ? Array.from(new Set(product.variants.map((v) => v.color))) : []),
    [product],
  );
  const sizesForColor = useMemo(
    () => product?.variants.filter((v) => v.color === selectedColor) ?? [],
    [product, selectedColor],
  );
  const selectedVariant = useMemo(
    () => sizesForColor.find((v) => v.size === selectedSize) ?? null,
    [sizesForColor, selectedSize],
  );

  useEffect(() => {
    if (!product) return;
    const firstAvailable = product.variants.find((v) => v.stockQuantity > 0) ?? product.variants[0];
    if (firstAvailable) {
      setSelectedColor(firstAvailable.color);
      setSelectedSize(firstAvailable.size);
    }
  }, [product]);

  useEffect(() => setQuantity(1), [selectedVariant]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  if (!product) return <p className="text-muted-foreground">Không tìm thấy sản phẩm.</p>;

  const images = product.images.length > 0 ? product.images : [];
  const currentImage = activeImage ?? images.find((i) => i.isThumbnail)?.imageUrl ?? images[0]?.imageUrl ?? null;

  async function handleAddToCart() {
    if (!selectedVariant) {
      toast.error('Vui lòng chọn size / màu');
      return;
    }
    try {
      await addCartMutation.mutateAsync({ variantId: selectedVariant.id, quantity });
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleAddWishlist() {
    try {
      await wishlistMutation.mutateAsync();
      toast.success('Đã thêm vào yêu thích');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/products">Sản phẩm</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1">{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted">
            <AnimatePresence mode="wait">
              {currentImage ? (
                <motion.img
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={`${API_BASE_URL}${currentImage}`}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">Không có ảnh</div>
              )}
            </AnimatePresence>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  className={cn(
                    'size-16 overflow-hidden rounded-md border-2 transition-colors',
                    currentImage === img.imageUrl ? 'border-foreground' : 'border-transparent hover:border-border',
                  )}
                >
                  <img src={`${API_BASE_URL}${img.imageUrl}`} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.brandName && (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{product.brandName}</p>
          )}
          <h1 className="font-display mt-1 text-2xl font-semibold text-foreground sm:text-3xl">{product.name}</h1>
          {product.reviewCount > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Stars value={product.averageRating ?? 0} />
              <span>
                {product.averageRating?.toFixed(1)} ({product.reviewCount} đánh giá)
              </span>
            </div>
          )}
          <p className="mt-4 text-2xl font-semibold text-foreground">
            {formatCurrency(selectedVariant?.price ?? product.basePrice)}
          </p>

          {product.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          <Separator className="my-6" />

          <div>
            <p className="mb-2.5 text-sm font-medium text-foreground">
              Màu sắc{selectedColor ? `: ${selectedColor}` : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    const available = product.variants.find((v) => v.color === color && v.stockQuantity > 0);
                    setSelectedSize(available?.size ?? product.variants.find((v) => v.color === color)!.size);
                  }}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm transition-colors',
                    selectedColor === color
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-foreground hover:border-foreground',
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2.5 text-sm font-medium text-foreground">Kích thước</p>
            <div className="flex flex-wrap gap-2">
              {sizesForColor.map((variant) => (
                <button
                  key={variant.id}
                  disabled={variant.stockQuantity <= 0}
                  onClick={() => setSelectedSize(variant.size)}
                  className={cn(
                    'relative min-w-11 rounded-md border px-3 py-2 text-sm transition-colors',
                    selectedSize === variant.size
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-foreground hover:border-foreground',
                    variant.stockQuantity <= 0 && 'cursor-not-allowed border-border text-muted-foreground/50 line-through',
                  )}
                >
                  {variant.size}
                </button>
              ))}
            </div>
            {selectedVariant && selectedVariant.stockQuantity > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">Còn {selectedVariant.stockQuantity} sản phẩm</p>
            )}
            {selectedVariant && selectedVariant.stockQuantity <= 0 && (
              <p className="mt-2 text-xs text-destructive">Hết hàng với lựa chọn này</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-none"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-none"
                onClick={() => setQuantity((q) => Math.min(selectedVariant?.stockQuantity ?? 99, q + 1))}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={addCartMutation.isPending || !selectedVariant || selectedVariant.stockQuantity <= 0}
              size="lg"
              className="flex-1"
            >
              Thêm vào giỏ hàng
            </Button>
            {isAuthenticated && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11"
                onClick={handleAddWishlist}
                aria-label="Yêu thích"
              >
                <Heart className="size-4.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display mb-6 text-xl font-semibold text-foreground">Đánh giá sản phẩm</h2>

        {isAuthenticated && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              reviewMutation.mutate();
            }}
            className="mb-8 space-y-3 rounded-xl border border-border bg-card p-5"
          >
            <p className="text-sm font-medium text-foreground">Đánh giá của bạn</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} sao`}>
                  <Star
                    className={cn('size-6 transition-colors', value <= rating ? 'fill-brand-500 text-brand-500' : 'text-muted-foreground/30')}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Nhận xét của bạn..."
              rows={3}
            />
            <Button type="submit" disabled={reviewMutation.isPending} size="sm">
              Gửi đánh giá
            </Button>
          </form>
        )}

        {reviews && reviews.content.length === 0 && <p className="text-sm text-muted-foreground">Chưa có đánh giá nào.</p>}

        <div className="space-y-5">
          {reviews?.content.map((review) => (
            <div key={review.id} className="flex gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-secondary text-xs">
                  {review.userName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{review.userName}</span>
                  <Stars value={review.rating} size={12} />
                </div>
                {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
