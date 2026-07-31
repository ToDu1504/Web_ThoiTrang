package com.fashionshop.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.fashionshop.entity.Product;
import com.fashionshop.entity.ProductStatus;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Product> findByBrandId(Long brandId, Pageable pageable);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
}
