import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, LogOut, Menu, Package, Search, ShoppingBag, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCart } from '../hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const NAV_LINKS = [
  { to: '/products', label: 'Tất cả sản phẩm' },
  { to: '/products?categoryId=1', label: 'Nữ' },
  { to: '/products?categoryId=2', label: 'Nam' },
  { to: '/products?sort=createdAt,desc', label: 'Hàng mới' },
];

export function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { data: cart } = useCart();
  const [keyword, setKeyword] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const isAdmin = user?.roles.some((role) => role === 'ROLE_ADMIN' || role === 'ROLE_STAFF');

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    navigate(keyword ? `/products?keyword=${encodeURIComponent(keyword)}` : '/products');
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="border-b border-border/60 bg-foreground py-1.5 text-center text-[11px] tracking-wide text-background">
        Miễn phí vận chuyển cho đơn hàng từ 500.000₫
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="mt-10 flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-foreground">
          FashionShop
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="group relative text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center md:flex">
            <AnimatePresence initial={false} mode="wait">
              {searchOpen ? (
                <motion.form
                  key="search-input"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  onSubmit={handleSearch}
                  className="overflow-hidden"
                >
                  <Input
                    autoFocus
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onBlur={() => !keyword && setSearchOpen(false)}
                    placeholder="Tìm sản phẩm..."
                    className="h-9 border-none bg-muted focus-visible:ring-1"
                  />
                </motion.form>
              ) : (
                <motion.div key="search-icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Button variant="ghost" size="icon" aria-label="Tìm kiếm" onClick={() => setSearchOpen(true)}>
                    <Search className="size-4.5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Tìm kiếm" className="md:hidden">
                <Search className="size-4.5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="p-4">
              <form onSubmit={handleSearch} className="mt-8 flex gap-2">
                <Input
                  autoFocus
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm sản phẩm..."
                />
                <Button type="submit" size="icon" aria-label="Tìm kiếm">
                  <Search className="size-4" />
                </Button>
              </form>
            </SheetContent>
          </Sheet>

          {isAuthenticated && (
            <Button variant="ghost" size="icon" asChild aria-label="Yêu thích">
              <Link to="/wishlist">
                <Heart className="size-4.5" />
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" asChild aria-label="Giỏ hàng" className="relative">
            <Link to="/cart">
              <ShoppingBag className="size-4.5" />
              <AnimatePresence>
                {!!cart?.totalQuantity && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white"
                  >
                    {cart.totalQuantity}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Tài khoản">
                  <User className="size-4.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-xs text-muted-foreground">Xin chào</p>
                  <p className="truncate text-sm font-medium">{user?.fullName ?? user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer">
                    <Package className="mr-2 size-4" /> Đơn hàng của tôi
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <ShoppingBag className="mr-2 size-4" /> Trang quản trị
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 size-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild aria-label="Đăng nhập">
              <Link to="/login">
                <User className="size-4.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
