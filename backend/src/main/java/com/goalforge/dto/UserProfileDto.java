package com.goalforge.dto;

import java.time.LocalDateTime;

public class UserProfileDto {

    private Long id;
    private String fullName;
    private String email;
    private String avatar;
    private LocalDateTime createdAt;
    private int totalGoals;
    private int completedGoals;
    private int currentStreak;
    private String themePreference;
    private Boolean notifyTaskDue;
    private Boolean notifyGoalCompleted;
    private Boolean notifyStreak;
    private Boolean notifyWeeklyDigest;

    public UserProfileDto() {
    }

    public UserProfileDto(Long id, String fullName, String email, String avatar, LocalDateTime createdAt,
                          int totalGoals, int completedGoals, int currentStreak, String themePreference,
                          Boolean notifyTaskDue, Boolean notifyGoalCompleted, Boolean notifyStreak, Boolean notifyWeeklyDigest) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.avatar = avatar;
        this.createdAt = createdAt;
        this.totalGoals = totalGoals;
        this.completedGoals = completedGoals;
        this.currentStreak = currentStreak;
        this.themePreference = themePreference;
        this.notifyTaskDue = notifyTaskDue;
        this.notifyGoalCompleted = notifyGoalCompleted;
        this.notifyStreak = notifyStreak;
        this.notifyWeeklyDigest = notifyWeeklyDigest;
    }

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

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public int getTotalGoals() {
        return totalGoals;
    }

    public void setTotalGoals(int totalGoals) {
        this.totalGoals = totalGoals;
    }

    public int getCompletedGoals() {
        return completedGoals;
    }

    public void setCompletedGoals(int completedGoals) {
        this.completedGoals = completedGoals;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
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
