package com.fashionshop.controller.admin;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fashionshop.dto.request.BrandRequest;
import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.dto.response.BrandResponse;
import com.fashionshop.service.BrandService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/brands")
@RequiredArgsConstructor
public class AdminBrandController {

    private final BrandService brandService;

    @PostMapping
    public ApiResponse<BrandResponse> create(@Valid @RequestBody BrandRequest request) {
        return ApiResponse.success("Tạo thương hiệu thành công", brandService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<BrandResponse> update(@PathVariable Long id, @Valid @RequestBody BrandRequest request) {
        return ApiResponse.success("Cập nhật thương hiệu thành công", brandService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        brandService.delete(id);
        return ApiResponse.success("Xóa thương hiệu thành công", null);
    }
}
