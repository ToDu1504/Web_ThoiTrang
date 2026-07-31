package com.fashionshop.service.impl;

import java.math.BigDecimal;

import org.springframework.data.jpa.domain.Specification;

import com.fashionshop.entity.Product;
import com.fashionshop.entity.ProductStatus;

final class ProductSpecifications {

    private ProductSpecifications() {
    }

    static Specification<Product> hasStatus(ProductStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    static Specification<Product> hasCategory(Long categoryId) {
        return (root, query, cb) -> categoryId == null ? null : cb.equal(root.get("category").get("id"), categoryId);
    }

    static Specification<Product> hasBrand(Long brandId) {
        return (root, query, cb) -> brandId == null ? null : cb.equal(root.get("brand").get("id"), brandId);
    }

    static Specification<Product> nameContains(String keyword) {
        return (root, query, cb) -> (keyword == null || keyword.isBlank())
                ? null
                : cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%");
    }

    static Specification<Product> priceGreaterOrEqual(BigDecimal minPrice) {
        return (root, query, cb) -> minPrice == null ? null : cb.greaterThanOrEqualTo(root.get("basePrice"), minPrice);
    }

    static Specification<Product> priceLessOrEqual(BigDecimal maxPrice) {
        return (root, query, cb) -> maxPrice == null ? null : cb.lessThanOrEqualTo(root.get("basePrice"), maxPrice);
    }
}
