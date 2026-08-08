import { Link } from 'react-router-dom';

const SHOP_LINKS = [
  { to: '/products', label: 'Tất cả sản phẩm' },
  { to: '/products?categoryId=1', label: 'Nữ' },
  { to: '/products?categoryId=2', label: 'Nam' },
];

const ACCOUNT_LINKS = [
  { to: '/orders', label: 'Đơn hàng của tôi' },
  { to: '/wishlist', label: 'Sản phẩm yêu thích' },
  { to: '/cart', label: 'Giỏ hàng' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-xl font-semibold">FashionShop</p>
          <p className="mt-3 max-w-55 text-sm text-background/60">
            Thời trang hiện đại, chất lượng, dành cho mọi phong cách.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-background/50">Mua sắm</p>
          <ul className="mt-4 space-y-2.5">
            {SHOP_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-sm text-background/75 transition-colors hover:text-background">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-background/50">Tài khoản</p>
          <ul className="mt-4 space-y-2.5">
            {ACCOUNT_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-sm text-background/75 transition-colors hover:text-background">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-background/50">Thanh toán</p>
          <ul className="mt-4 space-y-2.5 text-sm text-background/75">
            <li>Thanh toán khi nhận hàng (COD)</li>
            <li>MoMo</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10 py-5">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-background/50">
          © {new Date().getFullYear()} FashionShop. Đồ án website bán quần áo.
        </p>
      </div>
    </footer>
  );
}
