package com.fashionshop.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fashionshop.dto.response.WishlistResponse;
import com.fashionshop.entity.Product;
import com.fashionshop.entity.ProductImage;
import com.fashionshop.entity.User;
import com.fashionshop.entity.Wishlist;
import com.fashionshop.exception.BusinessException;
import com.fashionshop.exception.ResourceNotFoundException;
import com.fashionshop.repository.ProductRepository;
import com.fashionshop.repository.UserRepository;
import com.fashionshop.repository.WishlistRepository;
import com.fashionshop.service.WishlistService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public WishlistResponse add(Long userId, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BusinessException("Sản phẩm đã có trong danh sách yêu thích");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        Wishlist wishlist = Wishlist.builder().user(user).product(product).build();
        wishlistRepository.save(wishlist);

        return toResponse(wishlist);
    }

    @Override
    @Transactional
    public void remove(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getMyWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    private WishlistResponse toResponse(Wishlist wishlist) {
        Product product = wishlist.getProduct();
        String thumbnailUrl = product.getImages().stream()
                .filter(ProductImage::getIsThumbnail)
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElseGet(() -> product.getImages().stream().map(ProductImage::getImageUrl).findFirst().orElse(null));

        return WishlistResponse.builder()
                .id(wishlist.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .basePrice(product.getBasePrice())
                .thumbnailUrl(thumbnailUrl)
                .build();
    }
}
