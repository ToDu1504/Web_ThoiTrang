package com.fashionshop.service;

import java.util.List;

import com.fashionshop.dto.response.WishlistResponse;

public interface WishlistService {

    WishlistResponse add(Long userId, Long productId);

    void remove(Long userId, Long productId);

    List<WishlistResponse> getMyWishlist(Long userId);
}
