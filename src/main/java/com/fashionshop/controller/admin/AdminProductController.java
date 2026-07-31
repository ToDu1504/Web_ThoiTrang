package com.fashionshop.controller.admin;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fashionshop.dto.request.ProductRequest;
import com.fashionshop.dto.request.ProductSearchRequest;
import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.dto.response.PageResponse;
import com.fashionshop.dto.response.ProductImageResponse;
import com.fashionshop.dto.response.ProductResponse;
import com.fashionshop.entity.ProductStatus;
import com.fashionshop.service.FileStorageService;
import com.fashionshop.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ApiResponse<PageResponse<ProductResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        ProductSearchRequest criteria = new ProductSearchRequest(
                keyword, categoryId, brandId, (BigDecimal) null, (BigDecimal) null, status);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductResponse> result = productService.search(criteria, pageable);

        return ApiResponse.success("Lấy danh sách sản phẩm thành công", PageResponse.from(result));
    }

    @PostMapping
    public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ApiResponse.success("Tạo sản phẩm thành công", productService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ApiResponse.success("Cập nhật sản phẩm thành công", productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponse.success("Xóa sản phẩm thành công", null);
    }

    @PostMapping("/{id}/images")
    public ApiResponse<ProductImageResponse> uploadImage(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean isThumbnail) {
        String imageUrl = fileStorageService.store(file);
        return ApiResponse.success("Tải ảnh lên thành công", productService.addImage(id, imageUrl, isThumbnail));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ApiResponse<Void> deleteImage(@PathVariable Long id, @PathVariable Long imageId) {
        productService.deleteImage(id, imageId);
        return ApiResponse.success("Xóa ảnh thành công", null);
    }
}
