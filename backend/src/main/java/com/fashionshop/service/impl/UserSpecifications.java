package com.fashionshop.service.impl;

import org.springframework.data.jpa.domain.Specification;

import com.fashionshop.entity.User;
import com.fashionshop.entity.UserStatus;

final class UserSpecifications {

    private UserSpecifications() {
    }

    static Specification<User> keywordContains(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("fullName")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern));
        };
    }

    static Specification<User> hasStatus(UserStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }
}
