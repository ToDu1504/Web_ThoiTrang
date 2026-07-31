package com.fashionshop.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.fashionshop.dto.request.ProductRequest;
import com.fashionshop.dto.request.ProductSearchRequest;
import com.fashionshop.dto.response.ProductImageResponse;
import com.fashionshop.dto.response.ProductResponse;

public interface ProductService {

    Page<ProductResponse> search(ProductSearchRequest criteria, Pageable pageable);

    ProductResponse getBySlug(String slug);

    ProductResponse getById(Long id);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);

    ProductImageResponse addImage(Long productId, String imageUrl, boolean isThumbnail);

    void deleteImage(Long productId, Long imageId);
}
