package com.fashionshop.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fashionshop.dto.request.BrandRequest;
import com.fashionshop.dto.response.BrandResponse;
import com.fashionshop.entity.Brand;
import com.fashionshop.exception.ResourceNotFoundException;
import com.fashionshop.repository.BrandRepository;
import com.fashionshop.service.BrandService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;

    @Override
    public List<BrandResponse> getAll() {
        return brandRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public BrandResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Override
    @Transactional
    public BrandResponse create(BrandRequest request) {
        Brand brand = Brand.builder().name(request.getName()).logoUrl(request.getLogoUrl()).build();
        brandRepository.save(brand);
        return toResponse(brand);
    }

    @Override
    @Transactional
    public BrandResponse update(Long id, BrandRequest request) {
        Brand brand = findEntity(id);
        brand.setName(request.getName());
        brand.setLogoUrl(request.getLogoUrl());
        brandRepository.save(brand);
        return toResponse(brand);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        brandRepository.delete(findEntity(id));
    }

    private Brand findEntity(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu với id: " + id));
    }

    private BrandResponse toResponse(Brand brand) {
        return BrandResponse.builder().id(brand.getId()).name(brand.getName()).logoUrl(brand.getLogoUrl()).build();
    }
}
