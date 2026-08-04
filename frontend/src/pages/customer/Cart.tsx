import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '../../hooks/useCart';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../lib/format';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function CartPage() {
  const { data: cart, isLoading } = useCart();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (isLoading) return <p className="text-gray-500">Đang tải giỏ hàng...</p>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Giỏ hàng trống</h1>
        <Link to="/products" className="mt-4 inline-block text-brand-600 hover:underline">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  function handleQuantityChange(itemId: number, quantity: number) {
    if (quantity < 1) return;
    updateMutation.mutate({ id: itemId, payload: { quantity } });
  }

  function handleCheckout() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Giỏ hàng</h1>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-md border border-gray-200 p-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
              {item.thumbnailUrl ? (
                <img src={`${API_BASE_URL}${item.thumbnailUrl}`} alt={item.productName} className="h-full w-full object-cover" />
              ) : null}
            </div>

            <div className="flex-1">
              <Link to={`/products/${item.productSlug}`} className="text-sm font-medium text-gray-900 hover:text-brand-600">
                {item.productName}
              </Link>
              <p className="text-xs text-gray-500">
                {item.size} / {item.color}
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-700">{formatCurrency(item.price)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                className="rounded border border-gray-300 p-1 text-gray-600 hover:bg-gray-50"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.availableStock}
                className="rounded border border-gray-300 p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <Plus size={14} />
              </button>
            </div>

            <p className="w-28 text-right text-sm font-medium text-gray-900">{formatCurrency(item.subtotal)}</p>

            <button
              onClick={() => removeMutation.mutate(item.id)}
              aria-label="Xóa"
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-4 border-t border-gray-200 pt-4">
        <span className="text-lg font-semibold text-gray-900">
          Tổng cộng: {formatCurrency(cart.totalAmount)}
        </span>
        <button
          onClick={handleCheckout}
          className="rounded-md bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Tiến hành đặt hàng
        </button>
      </div>
    </div>
  );
}
