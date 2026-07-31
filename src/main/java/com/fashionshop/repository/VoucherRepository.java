package com.fashionshop.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fashionshop.entity.Voucher;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCode(String code);
}
