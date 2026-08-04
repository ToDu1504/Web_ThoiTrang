import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { getCategories } from '../../api/categories';
import { createCategory, deleteCategory, updateCategory } from '../../api/admin/categories';
import { getErrorMessage } from '../../lib/errors';
import type { CategoryRequest } from '../../types/product';

const emptyForm: CategoryRequest = { name: '', slug: '', parentId: null };

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  }

  const createMutation = useMutation({
    mutationFn: (payload: CategoryRequest) => createCategory(payload),
    onSuccess: () => {
      invalidate();
      setForm(emptyForm);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryRequest }) => updateCategory(id, payload),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: invalidate,
    onError: (err) => setError(getErrorMessage(err)),
  });

  function handleSubmit() {
    setError(null);
    if (!form.name.trim()) {
      setError('Tên danh mục không được để trống');
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
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Danh mục</h1>

      <div className="mb-6 flex flex-wrap items-end gap-2 rounded-md border border-gray-200 p-4">
        <div>
          <label className="block text-xs text-gray-500">Tên danh mục</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Danh mục cha</label>
          <select
            value={form.parentId ?? ''}
            onChange={(e) => setForm({ ...form, parentId: e.target.value ? Number(e.target.value) : null })}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">(Không có)</option>
            {categories
              ?.filter((c) => c.id !== editingId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
        <button
          onClick={handleSubmit}
          className="rounded-md bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700"
        >
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
            <th className="py-2">Slug</th>
            <th className="py-2">Danh mục cha</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {categories?.map((c) => (
            <tr key={c.id} className="border-b border-gray-100">
              <td className="py-2">{c.name}</td>
              <td className="py-2 text-gray-500">{c.slug}</td>
              <td className="py-2 text-gray-500">{c.parentName ?? '-'}</td>
              <td className="py-2 text-right">
                <button onClick={() => startEdit(c.id, c.name, c.parentId)} className="mr-2 text-gray-500 hover:text-brand-600">
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteMutation.mutate(c.id)} className="text-gray-500 hover:text-red-600">
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
