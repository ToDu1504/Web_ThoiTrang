import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../lib/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    setServerError(null);
    setSubmitting(true);
    try {
      const auth = await login(values);
      setAuth(auth);
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error, 'Đăng nhập thất bại'));
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
            Chào mừng trở lại <span className="italic text-brand-400">FashionShop</span>
          </p>
          <p className="mt-4 max-w-sm text-sm text-background/60">
            Đăng nhập để theo dõi đơn hàng, lưu sản phẩm yêu thích và trải nghiệm mua sắm nhanh hơn.
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
          <h1 className="font-display text-2xl font-semibold text-foreground">Đăng nhập</h1>
          <p className="mt-1 text-sm text-muted-foreground">Nhập thông tin tài khoản của bạn</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            {serverError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={submitting} className="w-full" size="lg">
              {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
              Đăng ký
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
