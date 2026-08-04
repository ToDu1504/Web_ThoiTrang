package com.fashionshop.service;

import java.util.List;

import com.fashionshop.dto.request.BrandRequest;
import com.fashionshop.dto.response.BrandResponse;

public interface BrandService {

    List<BrandResponse> getAll();

    BrandResponse getById(Long id);

    BrandResponse create(BrandRequest request);

    BrandResponse update(Long id, BrandRequest request);

    void delete(Long id);
}
