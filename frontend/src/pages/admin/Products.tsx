import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { adminSearchProducts, createProduct, deleteProduct, deleteProductImage, updateProduct, uploadProductImage } from '../../api/admin/products';
import { getCategories } from '../../api/categories';
import { getBrands } from '../../api/brands';
import { getErrorMessage } from '../../lib/errors';
import { formatCurrency } from '../../lib/format';
import type { ProductRequest, ProductResponse, ProductVariantRequest } from '../../types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const emptyVariant: ProductVariantRequest = { size: '', color: '', sku: '', stockQuantity: 0 };
const emptyForm: ProductRequest = {
  name: '',
  description: '',
  categoryId: 0,
  brandId: undefined,
  basePrice: 0,
  variants: [{ ...emptyVariant }],
};

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: getBrands });
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminSearchProducts({ page: 0, size: 50 }),
  });

  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }

  const createMutation = useMutation({
    mutationFn: (payload: ProductRequest) => createProduct(payload),
    onSuccess: () => {
      invalidate();
      resetForm();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductRequest }) => updateProduct(id, payload),
    onSuccess: () => {
      invalidate();
      resetForm();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({ mutationFn: (id: number) => deleteProduct(id), onSuccess: invalidate });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => uploadProductImage(id, file, false),
    onSuccess: invalidate,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) => deleteProductImage(productId, imageId),
    onSuccess: invalidate,
  });

  function resetForm() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    setError(null);
  }

  function startEdit(product: ProductResponse) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description ?? '',
      categoryId: product.categoryId ?? 0,
      brandId: product.brandId ?? undefined,
      basePrice: product.basePrice,
      status: product.status,
      variants: product.variants.map((v) => ({
        size: v.size,
        color: v.color,
        sku: v.sku,
        price: v.price,
        stockQuantity: v.stockQuantity,
      })),
    });
    setShowForm(true);
  }

  function updateVariant(index: number, field: keyof ProductVariantRequest, value: string | number) {
    const next = [...(form.variants ?? [])];
    next[index] = { ...next[index], [field]: value };
    setForm({ ...form, variants: next });
  }

  function handleSubmit() {
    setError(null);
    if (!form.name.trim() || !form.categoryId || !form.basePrice) {
      setError('Vui lòng nhập đầy đủ tên, danh mục, giá sản phẩm');
      return;
    }
    if (editing) updateMutation.mutate({ id: editing.id, payload: form });
    else createMutation.mutate(form);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">Sản phẩm</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="size-4" /> Thêm sản phẩm
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Sửa: ${editing.name}` : 'Sản phẩm mới'}</DialogTitle>
          </DialogHeader>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tên sản phẩm</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Giá gốc</Label>
              <Input
                type="number"
                value={form.basePrice || ''}
                onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Danh mục</Label>
              <Select
                value={form.categoryId ? String(form.categoryId) : ''}
                onValueChange={(v) => setForm({ ...form, categoryId: Number(v) })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Chọn --" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Thương hiệu</Label>
              <Select
                value={form.brandId ? String(form.brandId) : 'none'}
                onValueChange={(v) => setForm({ ...form, brandId: v === 'none' ? undefined : Number(v) })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Không --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Không --</SelectItem>
                  {brands?.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Mô tả</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Biến thể (size / màu / SKU / tồn kho)</Label>
              <button
                onClick={() => setForm({ ...form, variants: [...(form.variants ?? []), { ...emptyVariant }] })}
                className="text-xs font-medium text-foreground underline underline-offset-2"
              >
                + Thêm biến thể
              </button>
            </div>
            <div className="space-y-2">
              {form.variants?.map((variant, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Size"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    placeholder="Màu"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    className="w-24"
                  />
                  <Input
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Tồn kho"
                    value={variant.stockQuantity || ''}
                    onChange={(e) => updateVariant(index, 'stockQuantity', Number(e.target.value))}
                    className="w-24"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setForm({ ...form, variants: form.variants?.filter((_, i) => i !== index) })}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {editing && (
            <div>
              <Label className="mb-2 block text-sm font-medium text-foreground">Ảnh sản phẩm</Label>
              <div className="flex flex-wrap gap-2">
                {editing.images.map((img) => (
                  <div key={img.id} className="relative size-16 overflow-hidden rounded-md border border-border">
                    <img src={`${API_BASE_URL}${img.imageUrl}`} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => deleteImageMutation.mutate({ productId: editing.id, imageId: img.id })}
                      className="absolute right-0 top-0 bg-background/80 p-0.5 text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
                <label className="flex size-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:border-foreground">
                  <Upload className="size-4.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadMutation.mutate({ id: editing.id, file });
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Cập nhật' : 'Tạo sản phẩm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {data?.content.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.categoryName}</TableCell>
                <TableCell className="text-muted-foreground">{formatCurrency(p.basePrice)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => startEdit(p)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(p.id)}
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
