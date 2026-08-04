package com.fashionshop.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.fashionshop.entity.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private BigDecimal totalRevenue;
    private BigDecimal revenueToday;
    private BigDecimal revenueThisMonth;
    private long totalOrders;
    private Map<OrderStatus, Long> ordersByStatus;
    private long totalUsers;
    private long totalProducts;
    private List<TopSellingProductResponse> topSellingProducts;
}
