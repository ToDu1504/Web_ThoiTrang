import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminSearchUsers, updateUserRoles, updateUserStatus } from '../../api/admin/users';
import { useAuthStore } from '../../store/authStore';

const ALL_ROLES = ['ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_ADMIN'];

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.user?.roles.includes('ROLE_ADMIN'));
  const [keyword, setKeyword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', keyword],
    queryFn: () => adminSearchUsers({ keyword: keyword || undefined, page: 0, size: 50 }),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ACTIVE' | 'LOCKED' }) => updateUserStatus(id, status),
    onSuccess: invalidate,
  });

  const rolesMutation = useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: string[] }) => updateUserRoles(id, roles),
    onSuccess: invalidate,
  });

  function toggleRole(userId: number, currentRoles: string[], role: string) {
    const next = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    if (next.length === 0) return;
    rolesMutation.mutate({ id: userId, roles: next });
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Người dùng</h1>

      <input
        placeholder="Tìm theo tên hoặc email..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="mb-4 w-72 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
      />

      {isLoading && <p className="text-gray-500">Đang tải...</p>}

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2">Họ tên</th>
            <th className="py-2">Email</th>
            <th className="py-2">Vai trò</th>
            <th className="py-2">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {data?.content.map((u) => (
            <tr key={u.id} className="border-b border-gray-100">
              <td className="py-2">{u.fullName}</td>
              <td className="py-2 text-gray-500">{u.email}</td>
              <td className="py-2">
                <div className="flex flex-wrap gap-1">
                  {ALL_ROLES.map((role) => (
                    <button
                      key={role}
                      disabled={!isAdmin}
                      onClick={() => toggleRole(u.id, u.roles, role)}
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        u.roles.includes(role)
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-gray-100 text-gray-400'
                      } ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      {role.replace('ROLE_', '')}
                    </button>
                  ))}
                </div>
              </td>
              <td className="py-2">
                <button
                  onClick={() =>
                    statusMutation.mutate({ id: u.id, status: u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' })
                  }
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!isAdmin && <p className="mt-2 text-xs text-gray-400">Chỉ ADMIN mới có thể thay đổi vai trò người dùng.</p>}
    </div>
  );
}
