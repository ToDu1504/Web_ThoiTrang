import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../../api/products';
import { getCategories } from '../../api/categories';
import { getBrands } from '../../api/brands';
import { ProductCard } from '../../components/ProductCard';

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') ?? undefined;
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const brandId = searchParams.get('brandId') ?? undefined;
  const minPrice = searchParams.get('minPrice') ?? undefined;
  const maxPrice = searchParams.get('maxPrice') ?? undefined;

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: getBrands });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { keyword, categoryId, brandId, minPrice, maxPrice }],
    queryFn: () =>
      searchProducts({
        keyword,
        categoryId: categoryId ? Number(categoryId) : undefined,
        brandId: brandId ? Number(brandId) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: 0,
        size: 24,
        sort: 'createdAt,desc',
      }),
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-gray-900">
        {keyword ? `Kết quả tìm kiếm: "${keyword}"` : 'Tất cả sản phẩm'}
      </h1>

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={categoryId ?? ''}
          onChange={(event) => updateParam('categoryId', event.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">Tất cả danh mục</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={brandId ?? ''}
          onChange={(event) => updateParam('brandId', event.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">Tất cả thương hiệu</option>
          {brands?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Giá từ"
          value={minPrice ?? ''}
          onChange={(event) => updateParam('minPrice', event.target.value)}
          className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <input
          type="number"
          placeholder="Giá đến"
          value={maxPrice ?? ''}
          onChange={(event) => updateParam('maxPrice', event.target.value)}
          className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>

      {isLoading && <p className="text-gray-500">Đang tải...</p>}
      {isError && <p className="text-red-600">Không thể tải sản phẩm.</p>}
      {data && data.content.length === 0 && <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>}

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
