package com.fashionshop.dto.response;

import java.math.BigDecimal;

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
public class CartItemResponse {

    private Long id;
    private Long variantId;
    private Long productId;
    private String productName;
    private String productSlug;
    private String size;
    private String color;
    private String sku;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;
    private Integer availableStock;
    private String thumbnailUrl;
}
