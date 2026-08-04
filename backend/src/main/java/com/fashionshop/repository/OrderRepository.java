package com.fashionshop.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fashionshop.entity.Order;
import com.fashionshop.entity.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    Page<Order> findByUserId(Long userId, Pageable pageable);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    long countByStatus(OrderStatus status);

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.paymentStatus = com.fashionshop.entity.PaymentStatus.PAID")
    BigDecimal sumRevenue();

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o "
            + "where o.paymentStatus = com.fashionshop.entity.PaymentStatus.PAID and o.createdAt >= :from")
    BigDecimal sumRevenueSince(@Param("from") LocalDateTime from);
}
