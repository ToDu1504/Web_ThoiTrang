package com.fashionshop.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.fashionshop.dto.request.CreateOrderRequest;
import com.fashionshop.dto.response.OrderItemResponse;
import com.fashionshop.dto.response.OrderResponse;
import com.fashionshop.entity.Cart;
import com.fashionshop.entity.CartItem;
import com.fashionshop.entity.DiscountType;
import com.fashionshop.entity.Order;
import com.fashionshop.entity.OrderItem;
import com.fashionshop.entity.OrderStatus;
import com.fashionshop.entity.PaymentMethod;
import com.fashionshop.entity.PaymentStatus;
import com.fashionshop.entity.ProductVariant;
import com.fashionshop.entity.User;
import com.fashionshop.entity.Voucher;
import com.fashionshop.exception.BusinessException;
import com.fashionshop.exception.ResourceNotFoundException;
import com.fashionshop.repository.CartRepository;
import com.fashionshop.repository.OrderRepository;
import com.fashionshop.repository.ProductVariantRepository;
import com.fashionshop.repository.UserRepository;
import com.fashionshop.repository.VoucherRepository;
import com.fashionshop.service.MoMoService;
import com.fashionshop.service.OrderService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final Set<OrderStatus> TERMINAL_STATUSES = Set.of(OrderStatus.COMPLETED, OrderStatus.CANCELLED);
    private static final DateTimeFormatter ORDER_CODE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final MoMoService moMoService;

    @Value("${app.shipping-fee:30000}")
    private BigDecimal shippingFee;

    @Override
    @Transactional
    public OrderResponse checkout(Long userId, CreateOrderRequest request, String clientIp) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Giỏ hàng trống"));

        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Giỏ hàng trống");
        }

        Order order = Order.builder()
                .user(user)
                .orderCode(generateOrderCode())
                .status(OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.COD)
                .paymentStatus(PaymentStatus.UNPAID)
                .shippingAddress(request.getShippingAddress())
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .shippingFee(shippingFee)
                .discountAmount(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            ProductVariant lockedVariant = productVariantRepository.findByIdForUpdate(cartItem.getVariant().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể sản phẩm"));

            if (lockedVariant.getStockQuantity() < cartItem.getQuantity()) {
                throw new BusinessException(
                        "Sản phẩm " + lockedVariant.getProduct().getName() + " (" + lockedVariant.getSize() + "/"
                                + lockedVariant.getColor() + ") không đủ tồn kho, chỉ còn " + lockedVariant.getStockQuantity());
            }

            lockedVariant.setStockQuantity(lockedVariant.getStockQuantity() - cartItem.getQuantity());
            productVariantRepository.save(lockedVariant);

            BigDecimal price = lockedVariant.getPrice();
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variant(lockedVariant)
                    .quantity(cartItem.getQuantity())
                    .price(price)
                    .build();
            order.getItems().add(orderItem);

            totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (StringUtils.hasText(request.getVoucherCode())) {
            Voucher voucher = voucherRepository.findByCodeForUpdate(request.getVoucherCode().trim().toUpperCase())
                    .orElseThrow(() -> new BusinessException("Mã voucher không tồn tại"));

            LocalDateTime now = LocalDateTime.now();
            if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
                throw new BusinessException("Voucher chưa đến thời gian áp dụng");
            }
            if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
                throw new BusinessException("Voucher đã hết hạn");
            }
            if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
                throw new BusinessException("Voucher đã hết lượt sử dụng");
            }
            if (voucher.getMinOrderValue() != null && totalAmount.compareTo(voucher.getMinOrderValue()) < 0) {
                throw new BusinessException(
                        "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng voucher (" + voucher.getMinOrderValue() + ")");
            }

            discountAmount = voucher.getDiscountType() == DiscountType.PERCENT
                    ? totalAmount.multiply(voucher.getDiscountValue())
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                    : voucher.getDiscountValue();
            if (discountAmount.compareTo(totalAmount) > 0) {
                discountAmount = totalAmount;
            }

            voucher.setUsedCount(voucher.getUsedCount() + 1);
            voucherRepository.save(voucher);

            order.setVoucher(voucher);
            order.setDiscountAmount(discountAmount);
        }

        order.setTotalAmount(totalAmount.subtract(discountAmount).add(shippingFee));
        orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        String paymentUrl = null;
        if (order.getPaymentMethod() == PaymentMethod.MOMO) {
            paymentUrl = moMoService.createPaymentUrl(order, clientIp);
        }

        return toResponse(order, paymentUrl);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderForUser(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));
        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy đơn hàng");
        }
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> searchAdmin(OrderStatus status, Pageable pageable) {
        if (status == null) {
            return orderRepository.findAll(pageable).map(this::toResponse);
        }
        return orderRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getByIdAdmin(Long orderId) {
        return toResponse(findEntity(orderId));
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = findEntity(orderId);
        if (TERMINAL_STATUSES.contains(order.getStatus())) {
            throw new BusinessException("Đơn hàng đã ở trạng thái cuối (" + order.getStatus() + "), không thể cập nhật");
        }
        order.setStatus(newStatus);
        if (newStatus == OrderStatus.COMPLETED && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }
        orderRepository.save(order);
        return toResponse(order);
    }

    @Override
    @Transactional
    public void markPaymentSuccess(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với mã: " + orderCode));

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            return;
        }

        order.setPaymentStatus(PaymentStatus.PAID);
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }
        orderRepository.save(order);
    }

    private Order findEntity(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));
    }

    private String generateOrderCode() {
        return "ORD" + LocalDateTime.now().format(ORDER_CODE_FORMAT);
    }

    private OrderResponse toResponse(Order order) {
        return toResponse(order, null);
    }

    private OrderResponse toResponse(Order order, String paymentUrl) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .variantId(item.getVariant().getId())
                        .productId(item.getVariant().getProduct().getId())
                        .productName(item.getVariant().getProduct().getName())
                        .size(item.getVariant().getSize())
                        .color(item.getVariant().getColor())
                        .sku(item.getVariant().getSku())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .voucherCode(order.getVoucher() != null ? order.getVoucher().getCode() : null)
                .shippingFee(order.getShippingFee())
                .shippingAddress(order.getShippingAddress())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .createdAt(order.getCreatedAt())
                .items(items)
                .paymentUrl(paymentUrl)
                .build();
    }
}
