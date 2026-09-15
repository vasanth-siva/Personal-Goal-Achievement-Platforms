package com.goalforge.controller;

import com.goalforge.dto.ApiResponse;
import com.goalforge.dto.NotificationDto;
import com.goalforge.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications(Authentication authentication) {
        String email = authentication.getName();
        List<NotificationDto> notifications = notificationService.getNotifications(email);
        return ResponseEntity.ok(ApiResponse.ok("Notifications retrieved successfully", notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication authentication) {
        String email = authentication.getName();
        long count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(ApiResponse.ok("Unread count retrieved", Collections.singletonMap("unreadCount", count)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationDto>> getNotification(@PathVariable Long id,
                                                                         Authentication authentication) {
        String email = authentication.getName();
        NotificationDto notification = notificationService.getNotificationById(id, email);
        return ResponseEntity.ok(ApiResponse.ok("Notification retrieved successfully", notification));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(@PathVariable Long id,
                                                                   Authentication authentication) {
        String email = authentication.getName();
        NotificationDto updated = notificationService.markAsRead(id, email);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", updated));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        String email = authentication.getName();
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id,
                                                                Authentication authentication) {
        String email = authentication.getName();
        notificationService.deleteNotification(id, email);
        return ResponseEntity.ok(ApiResponse.ok("Notification deleted successfully", null));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearAll(Authentication authentication) {
        String email = authentication.getName();
        notificationService.clearAll(email);
        return ResponseEntity.ok(ApiResponse.ok("All notifications cleared successfully", null));
    }
}
