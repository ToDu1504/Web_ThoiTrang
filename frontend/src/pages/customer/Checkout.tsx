import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Landmark, Truck } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { checkout } from '../../api/orders';
import { formatCurrency } from '../../lib/format';
import { getErrorMessage } from '../../lib/errors';
import type { PaymentMethod } from '../../types/order';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const checkoutSchema = z.object({
  shippingAddress: z.string().min(1, 'Vui lòng nhập địa chỉ giao hàng'),
  receiverName: z.string().min(1, 'Vui lòng nhập tên người nhận'),
  receiverPhone: z.string().min(1, 'Vui lòng nhập số điện thoại'),
  paymentMethod: z.enum(['COD', 'VNPAY']),
  voucherCode: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const PAYMENT_METHODS: { value: PaymentMethod; label: string; desc: string; icon: typeof Truck }[] = [
  { value: 'COD', label: 'Thanh toán khi nhận hàng', desc: 'Trả tiền mặt cho shipper', icon: Truck },
  { value: 'VNPAY', label: 'VNPay', desc: 'Thanh toán trực tuyến an toàn', icon: Landmark },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
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
    return <p className="text-muted-foreground">Giỏ hàng trống, không thể đặt hàng.</p>;
  }

  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-semibold text-foreground sm:text-3xl">Thanh toán</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <form
          id="checkout-form"
          onSubmit={handleSubmit((values) => {
            setServerError(null);
            checkoutMutation.mutate(values);
          })}
          className="space-y-6"
          noValidate
        >
          {serverError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="space-y-4 rounded-xl border border-border p-5">
            <p className="text-sm font-semibold text-foreground">Thông tin giao hàng</p>

            <div className="space-y-1.5">
              <Label htmlFor="receiverName">Tên người nhận</Label>
              <Input id="receiverName" {...register('receiverName')} />
              {errors.receiverName && <p className="text-xs text-destructive">{errors.receiverName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="receiverPhone">Số điện thoại</Label>
              <Input id="receiverPhone" {...register('receiverPhone')} />
              {errors.receiverPhone && <p className="text-xs text-destructive">{errors.receiverPhone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shippingAddress">Địa chỉ giao hàng</Label>
              <Textarea id="shippingAddress" rows={2} {...register('shippingAddress')} />
              {errors.shippingAddress && <p className="text-xs text-destructive">{errors.shippingAddress.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="voucherCode">Mã giảm giá (không bắt buộc)</Label>
              <Input id="voucherCode" placeholder="VD: SALE10" {...register('voucherCode')} />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border p-5">
            <p className="text-sm font-semibold text-foreground">Phương thức thanh toán</p>
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-3">
                  {PAYMENT_METHODS.map(({ value, label, desc, icon: Icon }) => (
                    <label
                      key={value}
                      htmlFor={value}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors',
                        field.value === value ? 'border-foreground bg-secondary' : 'border-border hover:bg-muted',
                      )}
                    >
                      <RadioGroupItem value={value} id={value} />
                      <Icon className="size-4.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
          </div>
        </form>

        <div className="h-fit rounded-xl bg-secondary p-6">
          <p className="font-display text-lg font-semibold text-foreground">Đơn hàng của bạn</p>
          <div className="mt-4 space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {item.productName} <span className="text-muted-foreground/70">({item.size}/{item.color}) x{item.quantity}</span>
                </span>
                <span className="shrink-0 font-medium text-foreground">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-base font-semibold text-foreground">
            <span>Tạm tính</span>
            <span>{formatCurrency(cart.totalAmount)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Phí vận chuyển và giảm giá (nếu có) sẽ được tính khi đặt hàng.</p>

          <Button type="submit" form="checkout-form" size="lg" disabled={checkoutMutation.isPending} className="mt-5 w-full">
            {checkoutMutation.isPending ? 'Đang xử lý...' : 'Đặt hàng'}
          </Button>
        </div>
      </div>
    </div>
  );
}
