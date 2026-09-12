package com.goalforge.controller;

import com.goalforge.dto.ApiResponse;
import com.goalforge.dto.AuthResponse;
import com.goalforge.dto.LoginRequest;
import com.goalforge.dto.RegisterRequest;
import com.goalforge.dto.UserResponse;
import com.goalforge.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity
                .ok(ApiResponse.ok("Authentication successful.", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to access user profile."));
        }

        String email = authentication.getName();
        UserResponse response = authService.getCurrentUser(email);

        return ResponseEntity
                .ok(ApiResponse.ok("Current user profile retrieved successfully.", response));
    }
}
