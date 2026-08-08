import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCategories } from '../../api/categories';
import { createCategory, deleteCategory, updateCategory } from '../../api/admin/categories';
import { getErrorMessage } from '../../lib/errors';
import type { CategoryRequest } from '../../types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const emptyForm: CategoryRequest = { name: '', slug: '', parentId: null };

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryRequest>(emptyForm);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  }

  const createMutation = useMutation({
    mutationFn: (payload: CategoryRequest) => createCategory(payload),
    onSuccess: () => {
      invalidate();
      setForm(emptyForm);
      toast.success('Đã thêm danh mục');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryRequest }) => updateCategory(id, payload),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      setForm(emptyForm);
      toast.success('Đã cập nhật danh mục');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  function handleSubmit() {
    if (!form.name.trim()) {
      toast.error('Tên danh mục không được để trống');
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
    } else {
      createMutation.mutate(form);
    }
  }

  function startEdit(id: number, name: string, parentId: number | null) {
    setEditingId(id);
    setForm({ name, parentId });
  }

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-foreground">Danh mục</h1>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Tên danh mục</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-48" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Danh mục cha</Label>
          <Select
            value={form.parentId ? String(form.parentId) : 'none'}
            onValueChange={(v) => setForm({ ...form, parentId: v === 'none' ? null : Number(v) })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">(Không có)</SelectItem>
              {categories
                ?.filter((c) => c.id !== editingId)
                .map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
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
              <TableHead>Slug</TableHead>
              <TableHead>Danh mục cha</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="text-muted-foreground">{c.parentName ?? '-'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => startEdit(c.id, c.name, c.parentId)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(c.id)}
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
