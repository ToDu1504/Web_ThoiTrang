package com.fashionshop.dto.response;

import java.math.BigDecimal;
import java.util.List;

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
public class CartResponse {

    private Long id;
    private String sessionId;
    private List<CartItemResponse> items;
    private int totalQuantity;
    private BigDecimal totalAmount;
}
