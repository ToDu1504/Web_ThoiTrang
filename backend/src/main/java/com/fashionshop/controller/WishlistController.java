package com.fashionshop.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fashionshop.dto.request.AddWishlistRequest;
import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.dto.response.WishlistResponse;
import com.fashionshop.security.SecurityUtils;
import com.fashionshop.service.WishlistService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ApiResponse<List<WishlistResponse>> getMyWishlist() {
        Long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.success("Lấy danh sách yêu thích thành công", wishlistService.getMyWishlist(userId));
    }

    @PostMapping
    public ApiResponse<WishlistResponse> add(@Valid @RequestBody AddWishlistRequest request) {
        Long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.success("Thêm vào danh sách yêu thích thành công",
                wishlistService.add(userId, request.getProductId()));
    }

    @DeleteMapping("/{productId}")
    public ApiResponse<Void> remove(@PathVariable Long productId) {
        Long userId = SecurityUtils.requireCurrentUserId();
        wishlistService.remove(userId, productId);
        return ApiResponse.success("Xóa khỏi danh sách yêu thích thành công", null);
    }
}
