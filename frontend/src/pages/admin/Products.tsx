import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { adminSearchProducts, createProduct, deleteProduct, deleteProductImage, updateProduct, uploadProductImage } from '../../api/admin/products';
import { getCategories } from '../../api/categories';
import { getBrands } from '../../api/brands';
import { getErrorMessage } from '../../lib/errors';
import { formatCurrency } from '../../lib/format';
import type { ProductRequest, ProductResponse, ProductVariantRequest } from '../../types/product';

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
        <h1 className="text-2xl font-semibold text-gray-900">Sản phẩm</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-1 rounded-md bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-md border border-gray-200 p-4">
          <h2 className="mb-3 font-medium text-gray-900">{editing ? `Sửa: ${editing.name}` : 'Sản phẩm mới'}</h2>

          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500">Tên sản phẩm</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Giá gốc</label>
              <input
                type="number"
                value={form.basePrice || ''}
                onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Danh mục</label>
              <select
                value={form.categoryId || ''}
                onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              >
                <option value="">-- Chọn --</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500">Thương hiệu</label>
              <select
                value={form.brandId ?? ''}
                onChange={(e) => setForm({ ...form, brandId: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              >
                <option value="">-- Không --</option>
                {brands?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500">Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Biến thể (size / màu / SKU / tồn kho)</label>
              <button
                onClick={() => setForm({ ...form, variants: [...(form.variants ?? []), { ...emptyVariant }] })}
                className="text-xs text-brand-600 hover:underline"
              >
                + Thêm biến thể
              </button>
            </div>
            {form.variants?.map((variant, index) => (
              <div key={index} className="mb-2 flex gap-2">
                <input
                  placeholder="Size"
                  value={variant.size}
                  onChange={(e) => updateVariant(index, 'size', e.target.value)}
                  className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
                <input
                  placeholder="Màu"
                  value={variant.color}
                  onChange={(e) => updateVariant(index, 'color', e.target.value)}
                  className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
                <input
                  placeholder="SKU"
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                  className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  placeholder="Tồn kho"
                  value={variant.stockQuantity || ''}
                  onChange={(e) => updateVariant(index, 'stockQuantity', Number(e.target.value))}
                  className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
                <button
                  onClick={() => setForm({ ...form, variants: form.variants?.filter((_, i) => i !== index) })}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {editing && (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Ảnh sản phẩm</label>
              <div className="flex flex-wrap gap-2">
                {editing.images.map((img) => (
                  <div key={img.id} className="relative h-16 w-16 overflow-hidden rounded border border-gray-200">
                    <img src={`${API_BASE_URL}${img.imageUrl}`} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => deleteImageMutation.mutate({ productId: editing.id, imageId: img.id })}
                      className="absolute right-0 top-0 bg-white/80 p-0.5 text-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 hover:border-brand-400">
                  <Upload size={18} />
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

          <div className="mt-4 flex gap-2">
            <button onClick={handleSubmit} className="rounded-md bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700">
              {editing ? 'Cập nhật' : 'Tạo sản phẩm'}
            </button>
            <button onClick={resetForm} className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-600">
              Hủy
            </button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-gray-500">Đang tải...</p>}

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2">Tên</th>
            <th className="py-2">Danh mục</th>
            <th className="py-2">Giá</th>
            <th className="py-2">Trạng thái</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {data?.content.map((p) => (
            <tr key={p.id} className="border-b border-gray-100">
              <td className="py-2">{p.name}</td>
              <td className="py-2 text-gray-500">{p.categoryName}</td>
              <td className="py-2">{formatCurrency(p.basePrice)}</td>
              <td className="py-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {p.status}
                </span>
              </td>
              <td className="py-2 text-right">
                <button onClick={() => startEdit(p)} className="mr-2 text-gray-500 hover:text-brand-600">
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteMutation.mutate(p.id)} className="text-gray-500 hover:text-red-600">
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
