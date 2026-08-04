import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ApiResponse } from '../../types/common';

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
    <div className="mx-auto max-w-md text-center">
      {!result && !error && <p className="text-gray-500">Đang xác minh thanh toán...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {result && (
        <>
          <h1 className={`text-2xl font-semibold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
            {result.success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
          </h1>
          <p className="mt-2 text-gray-600">Mã đơn hàng: {result.orderCode}</p>
        </>
      )}
      <Link to="/orders" className="mt-6 inline-block text-brand-600 hover:underline">
        Xem đơn hàng của tôi
      </Link>
    </div>
  );
}
