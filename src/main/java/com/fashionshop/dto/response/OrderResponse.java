package com.fashionshop.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fashionshop.entity.OrderStatus;
import com.fashionshop.entity.PaymentMethod;
import com.fashionshop.entity.PaymentStatus;

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
public class OrderResponse {

    private Long id;
    private String orderCode;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private String shippingAddress;
    private String receiverName;
    private String receiverPhone;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private String paymentUrl;
}
