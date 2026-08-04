package com.fashionshop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fashionshop.entity.ProductImage;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductId(Long productId);
}
