import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { getWishlist, removeWishlist } from '../../api/wishlist';
import { formatCurrency } from '../../lib/format';

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
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Danh sách yêu thích</h1>

      {isLoading && <p className="text-gray-500">Đang tải...</p>}
      {data && data.length === 0 && <p className="text-gray-500">Chưa có sản phẩm yêu thích nào.</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data?.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <Link to={`/products/${item.productSlug}`} className="block aspect-square bg-gray-100">
              {item.thumbnailUrl && (
                <img src={`${API_BASE_URL}${item.thumbnailUrl}`} alt={item.productName} className="h-full w-full object-cover" />
              )}
            </Link>
            <div className="p-3">
              <Link to={`/products/${item.productSlug}`} className="line-clamp-2 text-sm font-medium text-gray-900">
                {item.productName}
              </Link>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-brand-700">{formatCurrency(item.basePrice)}</span>
                <button
                  onClick={() => removeMutation.mutate(item.productId)}
                  aria-label="Xóa khỏi yêu thích"
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
