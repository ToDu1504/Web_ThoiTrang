import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { searchProducts } from '../../api/products';
import { getCategories } from '../../api/categories';
import { getBrands } from '../../api/brands';
import { ProductCard } from '../../components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Mới nhất' },
  { value: 'basePrice,asc', label: 'Giá: thấp đến cao' },
  { value: 'basePrice,desc', label: 'Giá: cao đến thấp' },
];

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') ?? undefined;
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const brandId = searchParams.get('brandId') ?? undefined;
  const minPrice = searchParams.get('minPrice') ?? undefined;
  const maxPrice = searchParams.get('maxPrice') ?? undefined;
  const sort = searchParams.get('sort') ?? 'createdAt,desc';

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: getBrands });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { keyword, categoryId, brandId, minPrice, maxPrice, sort }],
    queryFn: () =>
      searchProducts({
        keyword,
        categoryId: categoryId ? Number(categoryId) : undefined,
        brandId: brandId ? Number(brandId) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: 0,
        size: 24,
        sort,
      }),
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  const activeFilterCount = [categoryId, brandId, minPrice, maxPrice].filter(Boolean).length;

  function clearFilters() {
    const next = new URLSearchParams(searchParams);
    ['categoryId', 'brandId', 'minPrice', 'maxPrice'].forEach((key) => next.delete(key));
    setSearchParams(next);
  }

  const filters = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Danh mục</Label>
        <Select value={categoryId ?? 'all'} onValueChange={(v) => updateParam('categoryId', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thương hiệu</Label>
        <Select value={brandId ?? 'all'} onValueChange={(v) => updateParam('brandId', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tất cả thương hiệu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thương hiệu</SelectItem>
            {brands?.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Khoảng giá</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Từ"
            value={minPrice ?? ''}
            onChange={(event) => updateParam('minPrice', event.target.value)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Đến"
            value={maxPrice ?? ''}
            onChange={(event) => updateParam('maxPrice', event.target.value)}
          />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full justify-start px-0 text-muted-foreground">
          <X className="size-3.5" /> Xóa bộ lọc
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-foreground sm:text-3xl">
        {keyword ? `Kết quả tìm kiếm: "${keyword}"` : 'Tất cả sản phẩm'}
      </h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="size-4" />
                  Bộ lọc
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto p-5">
                <p className="mb-6 mt-8 text-sm font-semibold">Bộ lọc</p>
                {filters}
              </SheetContent>
            </Sheet>

            <p className="hidden text-sm text-muted-foreground sm:block">
              {data ? `${data.totalElements} sản phẩm` : ''}
            </p>

            <Select value={sort} onValueChange={(v) => updateParam('sort', v)}>
              <SelectTrigger className="ml-auto w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isError && <p className="text-destructive">Không thể tải sản phẩm.</p>}

          {isLoading && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-3/4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          )}

          {data && data.content.length === 0 && (
            <p className="py-16 text-center text-muted-foreground">Không tìm thấy sản phẩm nào.</p>
          )}

          {data && data.content.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
              {data.content.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
