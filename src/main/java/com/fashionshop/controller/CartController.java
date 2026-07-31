package com.fashionshop.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fashionshop.dto.request.AddCartItemRequest;
import com.fashionshop.dto.request.UpdateCartItemRequest;
import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.dto.response.CartResponse;
import com.fashionshop.security.SecurityUtils;
import com.fashionshop.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getCart(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        Long userId = SecurityUtils.getCurrentUser().map(p -> p.id()).orElse(null);
        return ApiResponse.success("Lấy giỏ hàng thành công", cartService.getCart(userId, sessionId));
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addItem(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody AddCartItemRequest request) {
        Long userId = SecurityUtils.getCurrentUser().map(p -> p.id()).orElse(null);
        return ApiResponse.success("Thêm vào giỏ hàng thành công", cartService.addItem(userId, sessionId, request));
    }

    @PutMapping("/items/{id}")
    public ApiResponse<CartResponse> updateItem(
            @PathVariable Long id,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        Long userId = SecurityUtils.getCurrentUser().map(p -> p.id()).orElse(null);
        return ApiResponse.success("Cập nhật giỏ hàng thành công", cartService.updateItem(userId, sessionId, id, request));
    }

    @DeleteMapping("/items/{id}")
    public ApiResponse<CartResponse> removeItem(
            @PathVariable Long id,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        Long userId = SecurityUtils.getCurrentUser().map(p -> p.id()).orElse(null);
        return ApiResponse.success("Xóa khỏi giỏ hàng thành công", cartService.removeItem(userId, sessionId, id));
    }
}
