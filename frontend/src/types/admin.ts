import type { OrderStatus } from './order';
import type { UserStatus } from './auth';

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export interface UpdateUserRolesRequest {
  roles: string[];
}

export interface TopSellingProductResponse {
  productId: number;
  productName: string;
  totalSold: number;
}

export interface DashboardStatsResponse {
  totalRevenue: number;
  revenueToday: number;
  revenueThisMonth: number;
  totalOrders: number;
  ordersByStatus: Record<OrderStatus, number>;
  totalUsers: number;
  totalProducts: number;
  topSellingProducts: TopSellingProductResponse[];
}
