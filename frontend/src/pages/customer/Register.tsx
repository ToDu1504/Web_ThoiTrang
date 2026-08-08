import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register as registerApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage, getFieldErrors } from '../../lib/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const registerSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên').max(100),
  email: z.email('Email không hợp lệ').max(100),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterForm) {
    setServerError(null);
    setSubmitting(true);
    try {
      const auth = await registerApi({ ...values, phone: values.phone || undefined });
      setAuth(auth);
      navigate('/', { replace: true });
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors) {
        for (const [field, message] of Object.entries(fieldErrors)) {
          setError(field as keyof RegisterForm, { message });
        }
      } else {
        setServerError(getErrorMessage(error, 'Đăng ký thất bại'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-my-8 grid min-h-[calc(100vh-14rem)] grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-foreground lg:flex lg:flex-col lg:justify-end lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)',
          }}
        />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative">
          <p className="font-display text-4xl font-semibold leading-tight text-background">
            Gia nhập <span className="italic text-brand-400">FashionShop</span>
          </p>
          <p className="mt-4 max-w-sm text-sm text-background/60">
            Tạo tài khoản để lưu địa chỉ giao hàng, theo dõi đơn và nhận ưu đãi dành riêng cho thành viên.
          </p>
        </motion.div>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-2xl font-semibold text-foreground">Đăng ký</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tạo tài khoản mới miễn phí</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            {serverError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Họ tên</Label>
              <Input id="fullName" {...register('fullName')} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Số điện thoại (không bắt buộc)</Label>
              <Input id="phone" autoComplete="tel" {...register('phone')} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={submitting} className="w-full" size="lg">
              {submitting ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
              Đăng nhập
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
