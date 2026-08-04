package com.fashionshop.controller.admin;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fashionshop.dto.request.VoucherRequest;
import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.dto.response.VoucherResponse;
import com.fashionshop.service.VoucherService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
public class AdminVoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ApiResponse<List<VoucherResponse>> getAll() {
        return ApiResponse.success("Lấy danh sách voucher thành công", voucherService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<VoucherResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Lấy chi tiết voucher thành công", voucherService.getById(id));
    }

    @PostMapping
    public ApiResponse<VoucherResponse> create(@Valid @RequestBody VoucherRequest request) {
        return ApiResponse.success("Tạo voucher thành công", voucherService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<VoucherResponse> update(@PathVariable Long id, @Valid @RequestBody VoucherRequest request) {
        return ApiResponse.success("Cập nhật voucher thành công", voucherService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        voucherService.delete(id);
        return ApiResponse.success("Xóa voucher thành công", null);
    }
}
