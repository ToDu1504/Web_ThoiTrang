import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../../api/products';
import { ProductCard } from '../../components/ProductCard';

export function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { page: 0, size: 8 }],
    queryFn: () => searchProducts({ page: 0, size: 8, sort: 'createdAt,desc' }),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Sản phẩm mới</h1>

      {isLoading && <p className="text-gray-500">Đang tải sản phẩm...</p>}
      {isError && <p className="text-red-600">Không thể tải sản phẩm. Kiểm tra backend đã chạy chưa.</p>}

      {data && data.content.length === 0 && (
        <p className="text-gray-500">Chưa có sản phẩm nào.</p>
      )}

      {data && data.content.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.content.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
