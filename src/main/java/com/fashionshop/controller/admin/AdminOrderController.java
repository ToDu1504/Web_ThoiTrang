package com.fashionshop.controller.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fashionshop.dto.request.UpdateOrderStatusRequest;
import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.dto.response.OrderResponse;
import com.fashionshop.dto.response.PageResponse;
import com.fashionshop.entity.OrderStatus;
import com.fashionshop.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ApiResponse<PageResponse<OrderResponse>> search(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderResponse> result = orderService.searchAdmin(status, pageable);
        return ApiResponse.success("Lấy danh sách đơn hàng thành công", PageResponse.from(result));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Lấy chi tiết đơn hàng thành công", orderService.getByIdAdmin(id));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<OrderResponse> updateStatus(
            @PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ApiResponse.success("Cập nhật trạng thái đơn hàng thành công",
                orderService.updateStatus(id, request.getStatus()));
    }
}
