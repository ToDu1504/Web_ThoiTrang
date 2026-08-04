package com.fashionshop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fashionshop.entity.Wishlist;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    List<Wishlist> findByUserId(Long userId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserIdAndProductId(Long userId, Long productId);
}
