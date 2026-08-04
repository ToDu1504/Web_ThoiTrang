package com.fashionshop.controller.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fashionshop.dto.request.UpdateUserRolesRequest;
import com.fashionshop.dto.request.UpdateUserStatusRequest;
import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.dto.response.PageResponse;
import com.fashionshop.dto.response.UserResponse;
import com.fashionshop.entity.UserStatus;
import com.fashionshop.service.AdminUserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ApiResponse<PageResponse<UserResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserResponse> result = adminUserService.search(keyword, status, pageable);
        return ApiResponse.success("Lấy danh sách người dùng thành công", PageResponse.from(result));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Lấy chi tiết người dùng thành công", adminUserService.getById(id));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<UserResponse> updateStatus(
            @PathVariable Long id, @Valid @RequestBody UpdateUserStatusRequest request) {
        return ApiResponse.success("Cập nhật trạng thái người dùng thành công",
                adminUserService.updateStatus(id, request.getStatus()));
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> updateRoles(
            @PathVariable Long id, @Valid @RequestBody UpdateUserRolesRequest request) {
        return ApiResponse.success("Cập nhật vai trò người dùng thành công",
                adminUserService.updateRoles(id, request.getRoles()));
    }
}
