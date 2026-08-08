import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createVoucher, deleteVoucher, getVouchers } from '../../api/admin/vouchers';
import { getErrorMessage } from '../../lib/errors';
import { formatCurrency } from '../../lib/format';
import type { VoucherRequest } from '../../types/voucher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
  }

  const createMutation = useMutation({
    mutationFn: (payload: VoucherRequest) => createVoucher(payload),
    onSuccess: () => {
      invalidate();
      setForm(emptyForm);
      toast.success('Đã thêm voucher');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({ mutationFn: (id: number) => deleteVoucher(id), onSuccess: invalidate });

  function handleSubmit() {
    if (!form.code.trim() || !form.discountValue) {
      toast.error('Vui lòng nhập mã và giá trị giảm giá');
      return;
    }
    createMutation.mutate(form);
  }

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-foreground">Voucher</h1>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Mã</Label>
          <Input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="w-28"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Loại</Label>
          <Select
            value={form.discountType}
            onValueChange={(v) => setForm({ ...form, discountType: v as 'PERCENT' | 'FIXED' })}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENT">Phần trăm (%)</SelectItem>
              <SelectItem value="FIXED">Số tiền cố định</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Giá trị</Label>
          <Input
            type="number"
            value={form.discountValue || ''}
            onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
            className="w-24"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Đơn tối thiểu</Label>
          <Input
            type="number"
            value={form.minOrderValue ?? ''}
            onChange={(e) => setForm({ ...form, minOrderValue: e.target.value ? Number(e.target.value) : undefined })}
            className="w-28"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Giới hạn lượt dùng</Label>
          <Input
            type="number"
            value={form.usageLimit ?? ''}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : undefined })}
            className="w-24"
          />
        </div>
        <Button onClick={handleSubmit} disabled={createMutation.isPending}>
          Thêm mới
        </Button>
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Đơn tối thiểu</TableHead>
              <TableHead>Đã dùng / Giới hạn</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers?.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium text-foreground">{v.code}</TableCell>
                <TableCell className="text-muted-foreground">{v.discountType === 'PERCENT' ? 'Phần trăm' : 'Cố định'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {v.discountType === 'PERCENT' ? `${v.discountValue}%` : formatCurrency(v.discountValue)}
                </TableCell>
                <TableCell className="text-muted-foreground">{v.minOrderValue ? formatCurrency(v.minOrderValue) : '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {v.usedCount} / {v.usageLimit ?? '∞'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(v.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
