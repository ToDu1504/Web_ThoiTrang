import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '../../hooks/useCart';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../lib/format';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function CartPage() {
  const { data: cart, isLoading } = useCart();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag className="size-7 text-muted-foreground" />
        </div>
        <h1 className="font-display mt-5 text-2xl font-semibold text-foreground">Giỏ hàng trống</h1>
        <p className="mt-1 text-sm text-muted-foreground">Hãy thêm vài sản phẩm bạn yêu thích nhé.</p>
        <Button asChild className="mt-6">
          <Link to="/products">Tiếp tục mua sắm</Link>
        </Button>
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
      <h1 className="font-display mb-8 text-2xl font-semibold text-foreground sm:text-3xl">
        Giỏ hàng <span className="text-muted-foreground">({cart.totalQuantity})</span>
      </h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-border">
          {cart.items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4 py-5 first:pt-0"
            >
              <Link to={`/products/${item.productSlug}`} className="size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.thumbnailUrl && (
                  <img src={`${API_BASE_URL}${item.thumbnailUrl}`} alt={item.productName} className="h-full w-full object-cover" />
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/products/${item.productSlug}`} className="text-sm font-medium text-foreground hover:text-brand-600">
                      {item.productName}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.size} / {item.color}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMutation.mutate(item.id)}
                    aria-label="Xóa"
                    className="text-muted-foreground/60 transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="flex items-end justify-between">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-7 text-center text-xs">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.availableStock}
                      className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(item.subtotal)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="h-fit rounded-xl bg-secondary p-6">
          <p className="font-display text-lg font-semibold text-foreground">Tóm tắt đơn hàng</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Tạm tính</span>
              <span>{formatCurrency(cart.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Vận chuyển</span>
              <span>Tính ở bước thanh toán</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-base font-semibold text-foreground">
            <span>Tổng cộng</span>
            <span>{formatCurrency(cart.totalAmount)}</span>
          </div>
          <Button onClick={handleCheckout} size="lg" className="mt-5 w-full">
            Tiến hành đặt hàng
          </Button>
        </div>
      </div>
    </div>
  );
}
