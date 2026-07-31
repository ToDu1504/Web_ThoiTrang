package com.fashionshop.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.fashionshop.dto.request.AddCartItemRequest;
import com.fashionshop.dto.request.UpdateCartItemRequest;
import com.fashionshop.dto.response.CartItemResponse;
import com.fashionshop.dto.response.CartResponse;
import com.fashionshop.entity.Cart;
import com.fashionshop.entity.CartItem;
import com.fashionshop.entity.ProductImage;
import com.fashionshop.entity.ProductVariant;
import com.fashionshop.entity.User;
import com.fashionshop.exception.BusinessException;
import com.fashionshop.exception.ResourceNotFoundException;
import com.fashionshop.repository.CartRepository;
import com.fashionshop.repository.ProductVariantRepository;
import com.fashionshop.repository.UserRepository;
import com.fashionshop.service.CartService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CartResponse getCart(Long userId, String sessionId) {
        return toResponse(resolveOrCreateCart(userId, sessionId));
    }

    @Override
    @Transactional
    public CartResponse addItem(Long userId, String sessionId, AddCartItemRequest request) {
        Cart cart = resolveOrCreateCart(userId, sessionId);
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể sản phẩm"));

        CartItem existing = cart.getItems().stream()
                .filter(item -> item.getVariant().getId().equals(variant.getId()))
                .findFirst()
                .orElse(null);

        int newQuantity = (existing != null ? existing.getQuantity() : 0) + request.getQuantity();
        if (newQuantity > variant.getStockQuantity()) {
            throw new BusinessException("Số lượng vượt quá tồn kho hiện có (" + variant.getStockQuantity() + ")");
        }

        if (existing != null) {
            existing.setQuantity(newQuantity);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(item);
        }

        Cart saved = cartRepository.save(cart);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public CartResponse updateItem(Long userId, String sessionId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = resolveOrCreateCart(userId, sessionId);
        CartItem item = findOwnedItem(cart, itemId);

        if (request.getQuantity() > item.getVariant().getStockQuantity()) {
            throw new BusinessException("Số lượng vượt quá tồn kho hiện có (" + item.getVariant().getStockQuantity() + ")");
        }
        item.setQuantity(request.getQuantity());

        Cart saved = cartRepository.save(cart);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long userId, String sessionId, Long itemId) {
        Cart cart = resolveOrCreateCart(userId, sessionId);
        CartItem item = findOwnedItem(cart, itemId);
        cart.getItems().remove(item);

        Cart saved = cartRepository.save(cart);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void clearCart(Long cartId) {
        cartRepository.findById(cartId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    private CartItem findOwnedItem(Cart cart, Long itemId) {
        return cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));
    }

    private Cart resolveOrCreateCart(Long userId, String sessionId) {
        if (userId != null) {
            return cartRepository.findByUserId(userId).orElseGet(() -> {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
                return cartRepository.save(Cart.builder().user(user).build());
            });
        }

        if (!StringUtils.hasText(sessionId)) {
            throw new BusinessException("Thiếu session id cho giỏ hàng khách (header X-Session-Id)");
        }

        return cartRepository.findBySessionId(sessionId)
                .orElseGet(() -> cartRepository.save(Cart.builder().sessionId(sessionId).build()));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        int totalQuantity = items.stream().mapToInt(CartItemResponse::getQuantity).sum();
        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .sessionId(cart.getSessionId())
                .items(items)
                .totalQuantity(totalQuantity)
                .totalAmount(totalAmount)
                .build();
    }

    private CartItemResponse toItemResponse(CartItem item) {
        ProductVariant variant = item.getVariant();
        var product = variant.getProduct();
        BigDecimal price = variant.getPrice();
        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

        String thumbnailUrl = product.getImages().stream()
                .filter(ProductImage::getIsThumbnail)
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElseGet(() -> product.getImages().stream()
                        .map(ProductImage::getImageUrl)
                        .findFirst()
                        .orElse(null));

        return CartItemResponse.builder()
                .id(item.getId())
                .variantId(variant.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .size(variant.getSize())
                .color(variant.getColor())
                .sku(variant.getSku())
                .price(price)
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .availableStock(variant.getStockQuantity())
                .thumbnailUrl(thumbnailUrl)
                .build();
    }
}
