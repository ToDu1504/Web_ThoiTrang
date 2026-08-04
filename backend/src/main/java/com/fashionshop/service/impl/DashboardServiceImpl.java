package com.fashionshop.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fashionshop.dto.response.DashboardStatsResponse;
import com.fashionshop.dto.response.TopSellingProductResponse;
import com.fashionshop.entity.OrderStatus;
import com.fashionshop.repository.OrderItemRepository;
import com.fashionshop.repository.OrderRepository;
import com.fashionshop.repository.ProductRepository;
import com.fashionshop.repository.UserRepository;
import com.fashionshop.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final int TOP_SELLING_LIMIT = 5;

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        Map<OrderStatus, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status, orderRepository.countByStatus(status));
        }

        List<TopSellingProductResponse> topSellingProducts = orderItemRepository
                .findTopSellingProducts(PageRequest.of(0, TOP_SELLING_LIMIT)).stream()
                .map(p -> TopSellingProductResponse.builder()
                        .productId(p.getProductId())
                        .productName(p.getProductName())
                        .totalSold(p.getTotalSold())
                        .build())
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalRevenue(orderRepository.sumRevenue())
                .revenueToday(orderRepository.sumRevenueSince(todayStart))
                .revenueThisMonth(orderRepository.sumRevenueSince(monthStart))
                .totalOrders(orderRepository.count())
                .ordersByStatus(ordersByStatus)
                .totalUsers(userRepository.count())
                .totalProducts(productRepository.count())
                .topSellingProducts(topSellingProducts)
                .build();
    }
}
