import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { getBrands } from '../../api/brands';
import { createBrand, deleteBrand, updateBrand } from '../../api/admin/brands';
import { getErrorMessage } from '../../lib/errors';
import type { BrandRequest } from '../../types/product';

const emptyForm: BrandRequest = { name: '', logoUrl: '' };

export function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: getBrands });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BrandRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['brands'] });
  }

  const createMutation = useMutation({
    mutationFn: (payload: BrandRequest) => createBrand(payload),
    onSuccess: () => {
      invalidate();
      setForm(emptyForm);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BrandRequest }) => updateBrand(id, payload),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBrand(id),
    onSuccess: invalidate,
    onError: (err) => setError(getErrorMessage(err)),
  });

  function handleSubmit() {
    setError(null);
    if (!form.name.trim()) {
      setError('Tên thương hiệu không được để trống');
      return;
    }
    if (editingId) updateMutation.mutate({ id: editingId, payload: form });
    else createMutation.mutate(form);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Thương hiệu</h1>

      <div className="mb-6 flex flex-wrap items-end gap-2 rounded-md border border-gray-200 p-4">
        <div>
          <label className="block text-xs text-gray-500">Tên thương hiệu</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Logo URL</label>
          <input
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <button onClick={handleSubmit} className="rounded-md bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700">
          {editingId ? 'Cập nhật' : 'Thêm mới'}
        </button>
        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
            className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-600"
          >
            Hủy
          </button>
        )}
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2">Tên</th>
            <th className="py-2">Logo URL</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {brands?.map((b) => (
            <tr key={b.id} className="border-b border-gray-100">
              <td className="py-2">{b.name}</td>
              <td className="py-2 text-gray-500">{b.logoUrl ?? '-'}</td>
              <td className="py-2 text-right">
                <button
                  onClick={() => {
                    setEditingId(b.id);
                    setForm({ name: b.name, logoUrl: b.logoUrl ?? '' });
                  }}
                  className="mr-2 text-gray-500 hover:text-brand-600"
                >
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteMutation.mutate(b.id)} className="text-gray-500 hover:text-red-600">
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
