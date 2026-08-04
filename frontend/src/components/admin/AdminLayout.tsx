import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingBag,
  Ticket,
  Users,
} from 'lucide-react';

const links = [
  { to: '/admin', label: 'Thống kê', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Sản phẩm', icon: Package },
  { to: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { to: '/admin/brands', label: 'Thương hiệu', icon: Tag },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { to: '/admin/vouchers', label: 'Voucher', icon: Ticket },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
];

export function AdminLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
        <h2 className="mb-4 px-2 text-lg font-semibold text-brand-700">Quản trị</h2>
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
