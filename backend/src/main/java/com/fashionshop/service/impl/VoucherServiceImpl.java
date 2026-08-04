package com.fashionshop.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fashionshop.dto.request.VoucherRequest;
import com.fashionshop.dto.response.VoucherResponse;
import com.fashionshop.entity.Voucher;
import com.fashionshop.exception.BusinessException;
import com.fashionshop.exception.ResourceNotFoundException;
import com.fashionshop.repository.VoucherRepository;
import com.fashionshop.service.VoucherService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    public List<VoucherResponse> getAll() {
        return voucherRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public VoucherResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Override
    @Transactional
    public VoucherResponse create(VoucherRequest request) {
        if (voucherRepository.findByCode(request.getCode()).isPresent()) {
            throw new BusinessException("Mã voucher đã tồn tại");
        }
        Voucher voucher = new Voucher();
        applyRequest(voucher, request);
        voucherRepository.save(voucher);
        return toResponse(voucher);
    }

    @Override
    @Transactional
    public VoucherResponse update(Long id, VoucherRequest request) {
        Voucher voucher = findEntity(id);
        applyRequest(voucher, request);
        voucherRepository.save(voucher);
        return toResponse(voucher);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        voucherRepository.delete(findEntity(id));
    }

    private void applyRequest(Voucher voucher, VoucherRequest request) {
        voucher.setCode(request.getCode().trim().toUpperCase());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinOrderValue(request.getMinOrderValue());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setUsageLimit(request.getUsageLimit());
    }

    private Voucher findEntity(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher với id: " + id));
    }

    private VoucherResponse toResponse(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .minOrderValue(voucher.getMinOrderValue())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .usageLimit(voucher.getUsageLimit())
                .usedCount(voucher.getUsedCount())
                .build();
    }
}
