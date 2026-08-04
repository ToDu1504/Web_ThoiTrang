package com.fashionshop.service;

import java.util.List;

import com.fashionshop.dto.request.VoucherRequest;
import com.fashionshop.dto.response.VoucherResponse;

public interface VoucherService {

    List<VoucherResponse> getAll();

    VoucherResponse getById(Long id);

    VoucherResponse create(VoucherRequest request);

    VoucherResponse update(Long id, VoucherRequest request);

    void delete(Long id);
}
