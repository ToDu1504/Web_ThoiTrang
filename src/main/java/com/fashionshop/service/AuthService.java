package com.fashionshop.service;

import com.fashionshop.dto.request.LoginRequest;
import com.fashionshop.dto.request.RegisterRequest;
import com.fashionshop.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(String refreshToken);
}
