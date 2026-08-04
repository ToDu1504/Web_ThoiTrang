import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { createVoucher, deleteVoucher, getVouchers } from '../../api/admin/vouchers';
import { getErrorMessage } from '../../lib/errors';
import { formatCurrency } from '../../lib/format';
import type { VoucherRequest } from '../../types/voucher';

const emptyForm: VoucherRequest = {
  code: '',
  discountType: 'PERCENT',
  discountValue: 0,
  minOrderValue: undefined,
  usageLimit: undefined,
};

export function AdminVouchersPage() {
  const queryClient = useQueryClient();
  const { data: vouchers } = useQuery({ queryKey: ['admin-vouchers'], queryFn: getVouchers });
  const [form, setForm] = useState<VoucherRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
  }

  const createMutation = useMutation({
    mutationFn: (payload: VoucherRequest) => createVoucher(payload),
    onSuccess: () => {
      invalidate();
      setForm(emptyForm);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({ mutationFn: (id: number) => deleteVoucher(id), onSuccess: invalidate });

  function handleSubmit() {
    setError(null);
    if (!form.code.trim() || !form.discountValue) {
      setError('Vui lòng nhập mã và giá trị giảm giá');
      return;
    }
    createMutation.mutate(form);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Voucher</h1>

      <div className="mb-6 flex flex-wrap items-end gap-2 rounded-md border border-gray-200 p-4">
        <div>
          <label className="block text-xs text-gray-500">Mã</label>
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="mt-1 w-28 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Loại</label>
          <select
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value as 'PERCENT' | 'FIXED' })}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="PERCENT">Phần trăm (%)</option>
            <option value="FIXED">Số tiền cố định</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500">Giá trị</label>
          <input
            type="number"
            value={form.discountValue || ''}
            onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
            className="mt-1 w-24 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Đơn tối thiểu</label>
          <input
            type="number"
            value={form.minOrderValue ?? ''}
            onChange={(e) => setForm({ ...form, minOrderValue: e.target.value ? Number(e.target.value) : undefined })}
            className="mt-1 w-28 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Giới hạn lượt dùng</label>
          <input
            type="number"
            value={form.usageLimit ?? ''}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : undefined })}
            className="mt-1 w-24 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <button onClick={handleSubmit} className="rounded-md bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700">
          Thêm mới
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2">Mã</th>
            <th className="py-2">Loại</th>
            <th className="py-2">Giá trị</th>
            <th className="py-2">Đơn tối thiểu</th>
            <th className="py-2">Đã dùng / Giới hạn</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {vouchers?.map((v) => (
            <tr key={v.id} className="border-b border-gray-100">
              <td className="py-2 font-medium">{v.code}</td>
              <td className="py-2">{v.discountType === 'PERCENT' ? 'Phần trăm' : 'Cố định'}</td>
              <td className="py-2">{v.discountType === 'PERCENT' ? `${v.discountValue}%` : formatCurrency(v.discountValue)}</td>
              <td className="py-2 text-gray-500">{v.minOrderValue ? formatCurrency(v.minOrderValue) : '-'}</td>
              <td className="py-2 text-gray-500">{v.usedCount} / {v.usageLimit ?? '∞'}</td>
              <td className="py-2 text-right">
                <button onClick={() => deleteMutation.mutate(v.id)} className="text-gray-500 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
