package com.goalforge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 255)
    private String avatar = "🚀";

    @Column(name = "theme_preference", length = 20)
    private String themePreference = "system";

    @Column(name = "notify_task_due")
    private Boolean notifyTaskDue = true;

    @Column(name = "notify_goal_completed")
    private Boolean notifyGoalCompleted = true;

    @Column(name = "notify_streak")
    private Boolean notifyStreak = true;

    @Column(name = "notify_weekly_digest")
    private Boolean notifyWeeklyDigest = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public User() {
    }

    public User(String fullName, String email, String password) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.avatar = "🚀";
        this.themePreference = "system";
        this.notifyTaskDue = true;
        this.notifyGoalCompleted = true;
        this.notifyStreak = true;
        this.notifyWeeklyDigest = false;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.avatar == null) this.avatar = "🚀";
        if (this.themePreference == null) this.themePreference = "system";
        if (this.notifyTaskDue == null) this.notifyTaskDue = true;
        if (this.notifyGoalCompleted == null) this.notifyGoalCompleted = true;
        if (this.notifyStreak == null) this.notifyStreak = true;
        if (this.notifyWeeklyDigest == null) this.notifyWeeklyDigest = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getThemePreference() {
        return themePreference;
    }

    public void setThemePreference(String themePreference) {
        this.themePreference = themePreference;
    }

    public Boolean getNotifyTaskDue() {
        return notifyTaskDue;
    }

    public void setNotifyTaskDue(Boolean notifyTaskDue) {
        this.notifyTaskDue = notifyTaskDue;
    }

    public Boolean getNotifyGoalCompleted() {
        return notifyGoalCompleted;
    }

    public void setNotifyGoalCompleted(Boolean notifyGoalCompleted) {
        this.notifyGoalCompleted = notifyGoalCompleted;
    }

    public Boolean getNotifyStreak() {
        return notifyStreak;
    }

    public void setNotifyStreak(Boolean notifyStreak) {
        this.notifyStreak = notifyStreak;
    }

    public Boolean getNotifyWeeklyDigest() {
        return notifyWeeklyDigest;
    }

    public void setNotifyWeeklyDigest(Boolean notifyWeeklyDigest) {
        this.notifyWeeklyDigest = notifyWeeklyDigest;
    }
}
