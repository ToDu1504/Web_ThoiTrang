package com.fashionshop.controller;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fashionshop.dto.request.ProductSearchRequest;
import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.dto.response.PageResponse;
import com.fashionshop.dto.response.ProductResponse;
import com.fashionshop.entity.ProductStatus;
import com.fashionshop.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ApiResponse<PageResponse<ProductResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        ProductSearchRequest criteria = new ProductSearchRequest(
                keyword, categoryId, brandId, minPrice, maxPrice, ProductStatus.ACTIVE);

        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        Page<ProductResponse> result = productService.search(criteria, pageable);

        return ApiResponse.success("Lấy danh sách sản phẩm thành công", PageResponse.from(result));
    }

    @GetMapping("/{slug}")
    public ApiResponse<ProductResponse> getBySlug(@PathVariable String slug) {
        return ApiResponse.success("Lấy chi tiết sản phẩm thành công", productService.getBySlug(slug));
    }

    private Sort resolveSort(String sort) {
        String[] parts = sort.split(",");
        String property = parts.length > 0 ? parts[0] : "createdAt";
        Sort.Direction direction = (parts.length > 1 && parts[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return Sort.by(direction, property);
    }
}
