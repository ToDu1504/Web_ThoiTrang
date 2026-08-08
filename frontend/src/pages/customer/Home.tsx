import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { searchProducts } from '../../api/products';
import { getCategories } from '../../api/categories';
import { ProductCard } from '../../components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const TRUST_BADGES = [
  { icon: Truck, title: 'Giao hàng toàn quốc', desc: 'Miễn phí cho đơn từ 500.000₫' },
  { icon: ShieldCheck, title: 'Thanh toán an toàn', desc: 'Hỗ trợ COD & VNPay' },
  { icon: RotateCcw, title: 'Sản phẩm chính hãng', desc: 'Kiểm định chất lượng kỹ càng' },
];

export function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { page: 0, size: 8 }],
    queryFn: () => searchProducts({ page: 0, size: 8, sort: 'createdAt,desc' }),
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const topCategories = categories?.filter((c) => !c.parentId).slice(0, 4);

  return (
    <div className="space-y-20">
      <section className="relative -mx-4 overflow-hidden rounded-none bg-secondary px-4 py-20 sm:mx-0 sm:rounded-2xl sm:px-12 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mx-auto max-w-xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Bộ sưu tập mới</p>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
            Phong cách của bạn, <span className="italic text-brand-600">định nghĩa mới</span>
          </h1>
          <p className="mt-5 text-balance text-base text-muted-foreground sm:text-lg">
            Khám phá những thiết kế thời trang hiện đại, chất liệu cao cấp — được chọn lọc cho mọi khoảnh khắc của bạn.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" asChild className="group">
              <Link to="/products">
                Mua sắm ngay
                <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/products?sort=createdAt,desc">Hàng mới về</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {topCategories && topCategories.length > 0 && (
        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {topCategories.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to={`/products?categoryId=${category.id}`}
                  className="group flex aspect-4/3 flex-col items-center justify-center gap-2 rounded-xl bg-muted text-center transition-colors hover:bg-brand-50"
                >
                  <span className="font-display text-lg font-medium text-foreground">{category.name}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Xem ngay <ArrowRight className="size-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Vừa lên kệ</p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-foreground sm:text-3xl">Sản phẩm mới</h2>
          </div>
          <Link to="/products" className="hidden items-center gap-1 text-sm font-medium text-foreground hover:text-brand-600 sm:flex">
            Xem tất cả <ArrowRight className="size-4" />
          </Link>
        </div>

        {isError && (
          <p className="text-destructive">Không thể tải sản phẩm. Kiểm tra backend đã chạy chưa.</p>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-3/4 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        )}

        {data && data.content.length === 0 && <p className="text-muted-foreground">Chưa có sản phẩm nào.</p>}

        {data && data.content.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {data.content.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-8 border-y border-border py-12 sm:grid-cols-3">
        {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
              <Icon className="size-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
