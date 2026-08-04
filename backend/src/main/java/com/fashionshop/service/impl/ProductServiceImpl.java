package com.fashionshop.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fashionshop.dto.request.ProductRequest;
import com.fashionshop.dto.request.ProductSearchRequest;
import com.fashionshop.dto.request.ProductVariantRequest;
import com.fashionshop.dto.response.ProductImageResponse;
import com.fashionshop.dto.response.ProductResponse;
import com.fashionshop.dto.response.ProductVariantResponse;
import com.fashionshop.entity.Brand;
import com.fashionshop.entity.Category;
import com.fashionshop.entity.Product;
import com.fashionshop.entity.ProductImage;
import com.fashionshop.entity.ProductStatus;
import com.fashionshop.entity.ProductVariant;
import com.fashionshop.exception.ResourceNotFoundException;
import com.fashionshop.repository.BrandRepository;
import com.fashionshop.repository.CategoryRepository;
import com.fashionshop.repository.ProductRepository;
import com.fashionshop.repository.ReviewRepository;
import com.fashionshop.service.ProductService;
import com.fashionshop.utils.SlugUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> search(ProductSearchRequest criteria, Pageable pageable) {
        Specification<Product> spec = Specification.allOf(
                ProductSpecifications.hasStatus(criteria.getStatus()),
                ProductSpecifications.hasCategory(criteria.getCategoryId()),
                ProductSpecifications.hasBrand(criteria.getBrandId()),
                ProductSpecifications.nameContains(criteria.getKeyword()),
                ProductSpecifications.priceGreaterOrEqual(criteria.getMinPrice()),
                ProductSpecifications.priceLessOrEqual(criteria.getMaxPrice()));

        return productRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#slug")
    public ProductResponse getBySlug(String slug) {
        return toResponse(productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với slug: " + slug)));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        applyRequest(product, request);
        productRepository.save(product);
        return toResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findEntity(id);
        applyRequest(product, request);
        productRepository.save(product);
        return toResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void delete(Long id) {
        productRepository.delete(findEntity(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductImageResponse addImage(Long productId, String imageUrl, boolean isThumbnail) {
        Product product = findEntity(productId);

        if (isThumbnail) {
            product.getImages().forEach(image -> image.setIsThumbnail(false));
        }

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .isThumbnail(isThumbnail || product.getImages().isEmpty())
                .build();
        product.getImages().add(image);
        Product saved = productRepository.saveAndFlush(product);

        ProductImage savedImage = saved.getImages().stream()
                .filter(img -> imageUrl.equals(img.getImageUrl()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Không thể xác định ảnh vừa lưu"));

        return ProductImageResponse.builder()
                .id(savedImage.getId())
                .imageUrl(savedImage.getImageUrl())
                .isThumbnail(savedImage.getIsThumbnail())
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteImage(Long productId, Long imageId) {
        Product product = findEntity(productId);
        boolean removed = product.getImages().removeIf(image -> image.getId().equals(imageId));
        if (!removed) {
            throw new ResourceNotFoundException("Không tìm thấy ảnh với id: " + imageId);
        }
        productRepository.save(product);
    }

    private void applyRequest(Product product, ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id: " + request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu với id: " + request.getBrandId()));
        }

        product.setName(request.getName());
        String slug = (request.getSlug() == null || request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getName())
                : SlugUtils.toSlug(request.getSlug());
        product.setSlug(slug);
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBrand(brand);
        product.setBasePrice(request.getBasePrice());
        product.setStatus(request.getStatus() != null ? request.getStatus() : ProductStatus.ACTIVE);

        if (request.getVariants() != null) {
            product.getVariants().clear();
            for (ProductVariantRequest variantRequest : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .size(variantRequest.getSize())
                        .color(variantRequest.getColor())
                        .sku(variantRequest.getSku())
                        .price(variantRequest.getPrice() != null ? variantRequest.getPrice() : request.getBasePrice())
                        .stockQuantity(variantRequest.getStockQuantity())
                        .build();
                product.getVariants().add(variant);
            }
        }
    }

    private Product findEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id));
    }

    private ProductResponse toResponse(Product product) {
        List<ProductVariantResponse> variants = product.getVariants().stream()
                .map(v -> ProductVariantResponse.builder()
                        .id(v.getId())
                        .size(v.getSize())
                        .color(v.getColor())
                        .sku(v.getSku())
                        .price(v.getPrice())
                        .stockQuantity(v.getStockQuantity())
                        .build())
                .collect(Collectors.toList());

        List<ProductImageResponse> images = product.getImages().stream()
                .map(i -> ProductImageResponse.builder()
                        .id(i.getId())
                        .imageUrl(i.getImageUrl())
                        .isThumbnail(i.getIsThumbnail())
                        .build())
                .collect(Collectors.toList());

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .basePrice(product.getBasePrice())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .variants(variants)
                .images(images)
                .averageRating(reviewRepository.findAverageRatingByProductId(product.getId()))
                .reviewCount(reviewRepository.countByProductId(product.getId()))
                .build();
    }
}
