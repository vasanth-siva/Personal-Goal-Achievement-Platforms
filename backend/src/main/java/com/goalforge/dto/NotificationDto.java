package com.goalforge.dto;

import java.time.LocalDateTime;

public class NotificationDto {

    private Long id;
    private String message;
    private String type; // TASK_DUE, GOAL_COMPLETED, STREAK, ACHIEVEMENT, SYSTEM
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String icon;

    public NotificationDto() {
    }

    public NotificationDto(Long id, String message, String type, Boolean isRead, LocalDateTime createdAt, String icon) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.icon = icon;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}
