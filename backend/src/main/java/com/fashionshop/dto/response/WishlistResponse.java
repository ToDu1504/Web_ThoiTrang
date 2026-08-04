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
public class WishlistResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private BigDecimal basePrice;
    private String thumbnailUrl;
}
