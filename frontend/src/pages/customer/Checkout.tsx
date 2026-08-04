import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useCart } from '../../hooks/useCart';
import { checkout } from '../../api/orders';
import { formatCurrency } from '../../lib/format';
import { getErrorMessage } from '../../lib/errors';
import type { PaymentMethod } from '../../types/order';

const checkoutSchema = z.object({
  shippingAddress: z.string().min(1, 'Vui lòng nhập địa chỉ giao hàng'),
  receiverName: z.string().min(1, 'Vui lòng nhập tên người nhận'),
  receiverPhone: z.string().min(1, 'Vui lòng nhập số điện thoại'),
  paymentMethod: z.enum(['COD', 'VNPAY']),
  voucherCode: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'COD' },
  });

  const checkoutMutation = useMutation({
    mutationFn: (values: CheckoutForm) =>
      checkout({
        shippingAddress: values.shippingAddress,
        receiverName: values.receiverName,
        receiverPhone: values.receiverPhone,
        paymentMethod: values.paymentMethod as PaymentMethod,
        voucherCode: values.voucherCode || undefined,
      }),
    onSuccess: (order) => {
      if (order.paymentUrl) {
        window.location.href = order.paymentUrl;
      } else {
        navigate(`/orders/${order.id}`, { replace: true });
      }
    },
    onError: (error) => setServerError(getErrorMessage(error, 'Đặt hàng thất bại')),
  });

  if (!cart || cart.items.length === 0) {
    return <p className="text-gray-500">Giỏ hàng trống, không thể đặt hàng.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <form
        onSubmit={handleSubmit((values) => {
          setServerError(null);
          checkoutMutation.mutate(values);
        })}
        className="space-y-4 md:col-span-2"
        noValidate
      >
        <h1 className="text-2xl font-semibold text-gray-900">Thông tin giao hàng</h1>

        {serverError && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Tên người nhận</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register('receiverName')}
          />
          {errors.receiverName && <p className="mt-1 text-sm text-red-600">{errors.receiverName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register('receiverPhone')}
          />
          {errors.receiverPhone && <p className="mt-1 text-sm text-red-600">{errors.receiverPhone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Địa chỉ giao hàng</label>
          <textarea
            rows={2}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register('shippingAddress')}
          />
          {errors.shippingAddress && <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mã giảm giá (không bắt buộc)</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="VD: SALE10"
            {...register('voucherCode')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phương thức thanh toán</label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="radio" value="COD" {...register('paymentMethod')} />
              Thanh toán khi nhận hàng (COD)
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="radio" value="VNPAY" {...register('paymentMethod')} />
              Thanh toán qua VNPay
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={checkoutMutation.isPending}
          className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {checkoutMutation.isPending ? 'Đang xử lý...' : 'Đặt hàng'}
        </button>
      </form>

      <div className="rounded-md border border-gray-200 p-4">
        <h2 className="mb-3 font-medium text-gray-900">Đơn hàng của bạn</h2>
        <div className="space-y-2">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600">
              <span>
                {item.productName} ({item.size}/{item.color}) x{item.quantity}
              </span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-gray-200 pt-3 text-right font-semibold text-gray-900">
          Tạm tính: {formatCurrency(cart.totalAmount)}
        </div>
        <p className="mt-1 text-xs text-gray-500">Phí vận chuyển và giảm giá (nếu có) sẽ được tính khi đặt hàng.</p>
      </div>
    </div>
  );
}
