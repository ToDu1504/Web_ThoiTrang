package com.fashionshop.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.fashionshop.entity.Role;
import com.fashionshop.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String[] DEFAULT_ROLES = { "ROLE_ADMIN", "ROLE_STAFF", "ROLE_CUSTOMER" };

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        for (String roleName : DEFAULT_ROLES) {
            roleRepository.findByName(roleName)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
        }
    }
}
