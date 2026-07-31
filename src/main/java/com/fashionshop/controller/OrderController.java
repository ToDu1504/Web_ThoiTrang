package com.fashionshop.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fashionshop.dto.request.CreateOrderRequest;
import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.dto.response.OrderResponse;
import com.fashionshop.dto.response.PageResponse;
import com.fashionshop.security.SecurityUtils;
import com.fashionshop.service.OrderService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ApiResponse<OrderResponse> checkout(
            @Valid @RequestBody CreateOrderRequest request, HttpServletRequest httpRequest) {
        Long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.success("Đặt hàng thành công",
                orderService.checkout(userId, request, httpRequest.getRemoteAddr()));
    }

    @GetMapping("/my-orders")
    public ApiResponse<PageResponse<OrderResponse>> myOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = SecurityUtils.requireCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderResponse> result = orderService.getMyOrders(userId, pageable);
        return ApiResponse.success("Lấy lịch sử đơn hàng thành công", PageResponse.from(result));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getById(@PathVariable Long id) {
        Long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.success("Lấy chi tiết đơn hàng thành công", orderService.getOrderForUser(userId, id));
    }
}
