package com.fashionshop.service;

import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.fashionshop.dto.response.UserResponse;
import com.fashionshop.entity.UserStatus;

public interface AdminUserService {

    Page<UserResponse> search(String keyword, UserStatus status, Pageable pageable);

    UserResponse getById(Long id);

    UserResponse updateStatus(Long id, UserStatus status);

    UserResponse updateRoles(Long id, Set<String> roleNames);
}
