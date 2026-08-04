package com.fashionshop.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.fashionshop.dto.request.CreateOrderRequest;
import com.fashionshop.dto.response.OrderResponse;
import com.fashionshop.entity.OrderStatus;

public interface OrderService {

    OrderResponse checkout(Long userId, CreateOrderRequest request, String clientIp);

    OrderResponse getOrderForUser(Long userId, Long orderId);

    Page<OrderResponse> getMyOrders(Long userId, Pageable pageable);

    Page<OrderResponse> searchAdmin(OrderStatus status, Pageable pageable);

    OrderResponse getByIdAdmin(Long orderId);

    OrderResponse updateStatus(Long orderId, OrderStatus newStatus);

    void markPaymentSuccess(String orderCode);
}
