import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingBag,
  Ticket,
  Users,
  LogOut,
  Store,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

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
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="px-4 py-4">
          <Link to="/admin" className="font-display text-lg font-semibold text-sidebar-foreground">
            FashionShop
          </Link>
          <p className="text-xs text-sidebar-foreground/50">Trang quản trị</p>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map(({ to, label, icon: Icon, end }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                          isActive ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : undefined
                        }
                      >
                        <Icon />
                        {label}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-3 px-3 pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/">
                  <Store /> Về cửa hàng
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <Separator />
          <div className="flex items-center gap-2 px-1">
            <Avatar className="size-8">
              <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">
                {(user?.fullName ?? user?.email ?? '?').slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground">{user?.fullName ?? user?.email}</p>
              <p className="truncate text-[11px] text-sidebar-foreground/50">{user?.roles.join(', ')}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              aria-label="Đăng xuất"
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b border-border px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
