import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { ApiResponse } from '../../types/common';
import { Button } from '@/components/ui/button';

interface VnPayResult {
  orderCode: string;
  success: boolean;
  responseCode: string;
}

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<VnPayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<ApiResponse<VnPayResult>>(`/api/payments/vnpay/return?${searchParams.toString()}`)
      .then((res) => setResult(res.data.data))
      .catch(() => setError('Không thể xác minh giao dịch thanh toán.'));
  }, [searchParams]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      {!result && !error && (
        <>
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Đang xác minh thanh toán...</p>
        </>
      )}

      {error && (
        <>
          <XCircle className="size-14 text-destructive" />
          <p className="mt-4 text-destructive">{error}</p>
        </>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          {result.success ? (
            <CheckCircle2 className="size-16 text-emerald-600" />
          ) : (
            <XCircle className="size-16 text-destructive" />
          )}
          <h1 className="font-display mt-5 text-2xl font-semibold text-foreground">
            {result.success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Mã đơn hàng: {result.orderCode}</p>
        </motion.div>
      )}

      <Button asChild className="mt-8">
        <Link to="/orders">Xem đơn hàng của tôi</Link>
      </Button>
    </div>
  );
}
