package com.fashionshop.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fashionshop.entity.ProductStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private BigDecimal basePrice;
    private ProductStatus status;
    private LocalDateTime createdAt;
    private List<ProductVariantResponse> variants;
    private List<ProductImageResponse> images;
}
