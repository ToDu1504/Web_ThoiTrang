import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { adminSearchUsers, updateUserRoles, updateUserStatus } from '../../api/admin/users';
import { useAuthStore } from '../../store/authStore';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
      <h1 className="font-display mb-6 text-2xl font-semibold text-foreground">Người dùng</h1>

      <div className="relative mb-4 w-72">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên hoặc email..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {data?.content.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-foreground">{u.fullName}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_ROLES.map((role) => (
                      <button
                        key={role}
                        disabled={!isAdmin}
                        onClick={() => toggleRole(u.id, u.roles, role)}
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs transition-colors',
                          u.roles.includes(role)
                            ? 'bg-brand-100 text-brand-700'
                            : 'bg-muted text-muted-foreground',
                          isAdmin ? 'cursor-pointer' : 'cursor-not-allowed',
                        )}
                      >
                        {role.replace('ROLE_', '')}
                      </button>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() =>
                      statusMutation.mutate({ id: u.id, status: u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' })
                    }
                  >
                    <Badge
                      variant="secondary"
                      className={u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}
                    >
                      {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                    </Badge>
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {!isAdmin && <p className="mt-2 text-xs text-muted-foreground">Chỉ ADMIN mới có thể thay đổi vai trò người dùng.</p>}
    </div>
  );
}
