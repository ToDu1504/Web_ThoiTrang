package com.fashionshop.service;

import com.fashionshop.dto.request.AddCartItemRequest;
import com.fashionshop.dto.request.UpdateCartItemRequest;
import com.fashionshop.dto.response.CartResponse;

public interface CartService {

    CartResponse getCart(Long userId, String sessionId);

    CartResponse addItem(Long userId, String sessionId, AddCartItemRequest request);

    CartResponse updateItem(Long userId, String sessionId, Long itemId, UpdateCartItemRequest request);

    CartResponse removeItem(Long userId, String sessionId, Long itemId);

    void clearCart(Long cartId);
}
