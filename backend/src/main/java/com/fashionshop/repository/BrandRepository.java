package com.fashionshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fashionshop.entity.Brand;

public interface BrandRepository extends JpaRepository<Brand, Long> {
}
