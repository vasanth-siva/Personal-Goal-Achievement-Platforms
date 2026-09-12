package com.goalforge.controller;

import com.goalforge.dto.*;
import com.goalforge.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(Authentication authentication) {
        String email = authentication.getName();
        UserProfileDto profile = userService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.ok("User profile retrieved successfully", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                                     Authentication authentication) {
        String email = authentication.getName();
        UserProfileDto updated = userService.updateProfile(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                                            Authentication authentication) {
        String email = authentication.getName();
        userService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<UserProfileDto>> updatePreferences(@RequestBody UpdatePreferencesRequest request,
                                                                         Authentication authentication) {
        String email = authentication.getName();
        UserProfileDto updated = userService.updatePreferences(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Preferences updated successfully", updated));
    }
}
