import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, LogOut, Package, Search, ShoppingCart, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCart } from '../hooks/useCart';

export function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { data: cart } = useCart();
  const [keyword, setKeyword] = useState('');
  const isAdmin = user?.roles.some((role) => role === 'ROLE_ADMIN' || role === 'ROLE_STAFF');

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    navigate(keyword ? `/products?keyword=${encodeURIComponent(keyword)}` : '/products');
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-xl font-semibold text-brand-700">
          FashionShop
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 max-w-sm items-center md:flex">
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm sản phẩm..."
            className="w-full rounded-l-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-1.5 text-gray-600 hover:bg-gray-100"
          >
            <Search size={16} />
          </button>
        </form>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin" className="text-sm text-gray-600 hover:text-brand-600">
              Quản trị
            </Link>
          )}

          <Link to="/cart" aria-label="Giỏ hàng" className="relative text-gray-600 hover:text-brand-600">
            <ShoppingCart size={20} />
            {!!cart?.totalQuantity && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
                {cart.totalQuantity}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/wishlist" aria-label="Yêu thích" className="text-gray-600 hover:text-brand-600">
                <Heart size={20} />
              </Link>
              <Link to="/orders" aria-label="Đơn hàng của tôi" className="text-gray-600 hover:text-brand-600">
                <Package size={20} />
              </Link>
              <span className="hidden text-sm text-gray-700 sm:inline">
                Xin chào, {user?.fullName ?? user?.email}
              </span>
              <button
                onClick={handleLogout}
                aria-label="Đăng xuất"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-1 text-sm text-gray-700 hover:text-brand-600">
              <User size={18} />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
