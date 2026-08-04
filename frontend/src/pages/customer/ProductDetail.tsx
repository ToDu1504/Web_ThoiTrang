import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Star } from 'lucide-react';
import { getProductBySlug } from '../../api/products';
import { getProductReviews, createReview } from '../../api/reviews';
import { addWishlist } from '../../api/wishlist';
import { useAddCartItem } from '../../hooks/useCart';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../lib/format';
import { getErrorMessage } from '../../lib/errors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
      setMessage({ type: 'success', text: 'Cảm ơn bạn đã đánh giá!' });
    },
    onError: (error) => setMessage({ type: 'error', text: getErrorMessage(error) }),
  });

  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product, selectedVariantId],
  );

  if (isLoading) return <p className="text-gray-500">Đang tải...</p>;
  if (!product) return <p className="text-gray-500">Không tìm thấy sản phẩm.</p>;

  const images = product.images.length > 0 ? product.images : [];
  const currentImage = activeImage ?? images.find((i) => i.isThumbnail)?.imageUrl ?? images[0]?.imageUrl ?? null;

  async function handleAddToCart() {
    if (!selectedVariant) {
      setMessage({ type: 'error', text: 'Vui lòng chọn size/màu' });
      return;
    }
    try {
      await addCartMutation.mutateAsync({ variantId: selectedVariant.id, quantity });
      setMessage({ type: 'success', text: 'Đã thêm vào giỏ hàng' });
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) });
    }
  }

  async function handleAddWishlist() {
    try {
      await wishlistMutation.mutateAsync();
      setMessage({ type: 'success', text: 'Đã thêm vào yêu thích' });
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) });
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            {currentImage ? (
              <img src={`${API_BASE_URL}${currentImage}`} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">Không có ảnh</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  className="h-16 w-16 overflow-hidden rounded border border-gray-200"
                >
                  <img src={`${API_BASE_URL}${img.imageUrl}`} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
          {product.reviewCount > 0 && (
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              {product.averageRating?.toFixed(1)} ({product.reviewCount} đánh giá)
            </p>
          )}
          <p className="mt-3 text-2xl font-semibold text-brand-700">
            {formatCurrency(selectedVariant?.price ?? product.basePrice)}
          </p>

          {product.description && <p className="mt-4 whitespace-pre-line text-sm text-gray-600">{product.description}</p>}

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700">Chọn size / màu</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  disabled={variant.stockQuantity <= 0}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    selectedVariantId === variant.id
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-gray-300 text-gray-700 hover:border-brand-400'
                  } ${variant.stockQuantity <= 0 ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  {variant.size} / {variant.color}
                  {variant.stockQuantity <= 0 && ' (hết hàng)'}
                </button>
              ))}
            </div>
          </div>

          {selectedVariant && (
            <p className="mt-2 text-xs text-gray-500">Còn {selectedVariant.stockQuantity} sản phẩm</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={selectedVariant?.stockQuantity ?? 99}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
              className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
            <button
              onClick={handleAddToCart}
              disabled={addCartMutation.isPending}
              className="flex-1 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              Thêm vào giỏ hàng
            </button>
            {isAuthenticated && (
              <button
                onClick={handleAddWishlist}
                aria-label="Yêu thích"
                className="rounded-md border border-gray-300 p-2 text-gray-600 hover:text-red-500"
              >
                <Heart size={18} />
              </button>
            )}
          </div>

          {message && (
            <p className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Đánh giá sản phẩm</h2>

        {isAuthenticated && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              reviewMutation.mutate();
            }}
            className="mb-6 space-y-2 rounded-md border border-gray-200 p-4"
          >
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} sao`}
                >
                  <Star size={20} className={value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Nhận xét của bạn..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={2}
            />
            <button
              type="submit"
              disabled={reviewMutation.isPending}
              className="rounded-md bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700 disabled:opacity-60"
            >
              Gửi đánh giá
            </button>
          </form>
        )}

        {reviews && reviews.content.length === 0 && <p className="text-sm text-gray-500">Chưa có đánh giá nào.</p>}

        <div className="space-y-4">
          {reviews?.content.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{review.userName}</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={12}
                      className={index < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </span>
              </div>
              {review.comment && <p className="mt-1 text-sm text-gray-600">{review.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
