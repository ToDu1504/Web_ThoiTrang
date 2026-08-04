package com.fashionshop.service.impl;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fashionshop.dto.response.UserResponse;
import com.fashionshop.entity.Role;
import com.fashionshop.entity.User;
import com.fashionshop.entity.UserStatus;
import com.fashionshop.exception.BusinessException;
import com.fashionshop.exception.ResourceNotFoundException;
import com.fashionshop.repository.RoleRepository;
import com.fashionshop.repository.UserRepository;
import com.fashionshop.service.AdminUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> search(String keyword, UserStatus status, Pageable pageable) {
        Specification<User> spec = Specification.allOf(
                UserSpecifications.keywordContains(keyword),
                UserSpecifications.hasStatus(status));
        return userRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Override
    @Transactional
    public UserResponse updateStatus(Long id, UserStatus status) {
        User user = findEntity(id);
        user.setStatus(status);
        userRepository.save(user);
        return toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateRoles(Long id, Set<String> roleNames) {
        User user = findEntity(id);

        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new BusinessException("Vai trò không hợp lệ: " + roleName));
            roles.add(role);
        }

        user.setRoles(roles);
        userRepository.save(user);
        return toResponse(user);
    }

    private User findEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + id));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }
}
