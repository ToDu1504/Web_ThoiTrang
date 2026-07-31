package com.fashionshop.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.dto.response.BrandResponse;
import com.fashionshop.service.BrandService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    public ApiResponse<List<BrandResponse>> getAll() {
        return ApiResponse.success("Lấy danh sách thương hiệu thành công", brandService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<BrandResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Lấy chi tiết thương hiệu thành công", brandService.getById(id));
    }
}
