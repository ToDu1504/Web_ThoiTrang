package com.fashionshop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fashionshop.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCartId(Long cartId);
}
