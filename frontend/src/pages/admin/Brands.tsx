import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getBrands } from '../../api/brands';
import { createBrand, deleteBrand, updateBrand } from '../../api/admin/brands';
import { getErrorMessage } from '../../lib/errors';
import type { BrandRequest } from '../../types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const emptyForm: BrandRequest = { name: '', logoUrl: '' };

export function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: getBrands });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BrandRequest>(emptyForm);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['brands'] });
  }

  const createMutation = useMutation({
    mutationFn: (payload: BrandRequest) => createBrand(payload),
    onSuccess: () => {
      invalidate();
      setForm(emptyForm);
      toast.success('Đã thêm thương hiệu');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BrandRequest }) => updateBrand(id, payload),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      setForm(emptyForm);
      toast.success('Đã cập nhật thương hiệu');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBrand(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  function handleSubmit() {
    if (!form.name.trim()) {
      toast.error('Tên thương hiệu không được để trống');
      return;
    }
    if (editingId) updateMutation.mutate({ id: editingId, payload: form });
    else createMutation.mutate(form);
  }

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-foreground">Thương hiệu</h1>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Tên thương hiệu</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-48" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Logo URL</Label>
          <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="w-64" />
        </div>
        <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
          {editingId ? 'Cập nhật' : 'Thêm mới'}
        </Button>
        {editingId && (
          <Button
            variant="outline"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
          >
            Hủy
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Logo URL</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands?.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium text-foreground">{b.name}</TableCell>
                <TableCell className="max-w-64 truncate text-muted-foreground">{b.logoUrl ?? '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setEditingId(b.id);
                      setForm({ name: b.name, logoUrl: b.logoUrl ?? '' });
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(b.id)}
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
