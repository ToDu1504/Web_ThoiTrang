package com.fashionshop.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fashionshop.dto.request.ReviewRequest;
import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.dto.response.PageResponse;
import com.fashionshop.dto.response.ReviewResponse;
import com.fashionshop.security.SecurityUtils;
import com.fashionshop.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/reviews")
    public ApiResponse<ReviewResponse> create(@Valid @RequestBody ReviewRequest request) {
        Long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.success("Đánh giá sản phẩm thành công", reviewService.create(userId, request));
    }

    @GetMapping("/api/products/{productId}/reviews")
    public ApiResponse<PageResponse<ReviewResponse>> getByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ReviewResponse> result = reviewService.getByProduct(productId, pageable);
        return ApiResponse.success("Lấy đánh giá sản phẩm thành công", PageResponse.from(result));
    }
}
