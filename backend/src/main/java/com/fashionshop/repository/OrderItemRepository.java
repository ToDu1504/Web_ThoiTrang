package com.fashionshop.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.fashionshop.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    @Query("select v.product.id as productId, v.product.name as productName, sum(oi.quantity) as totalSold "
            + "from OrderItem oi join oi.variant v join oi.order o "
            + "where o.status <> com.fashionshop.entity.OrderStatus.CANCELLED "
            + "group by v.product.id, v.product.name "
            + "order by sum(oi.quantity) desc")
    List<TopSellingProduct> findTopSellingProducts(Pageable pageable);

    interface TopSellingProduct {
        Long getProductId();

        String getProductName();

        Long getTotalSold();
    }
}
