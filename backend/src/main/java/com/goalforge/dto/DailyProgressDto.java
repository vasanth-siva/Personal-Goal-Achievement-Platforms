package com.goalforge.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DailyProgressDto {

    private Long id;
    private Long userId;
    private Long goalId;
    private String goalTitle;
    private LocalDate progressDate;

    @Min(value = 0, message = "Progress percentage cannot be negative")
    @Max(value = 100, message = "Progress percentage cannot exceed 100")
    private Integer progressPercentage = 0;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DailyProgressDto() {
    }

    public DailyProgressDto(Long id, Long userId, Long goalId, String goalTitle, LocalDate progressDate, Integer progressPercentage, String notes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.goalId = goalId;
        this.goalTitle = goalTitle;
        this.progressDate = progressDate;
        this.progressPercentage = progressPercentage != null ? progressPercentage : 0;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getGoalId() {
        return goalId;
    }

    public void setGoalId(Long goalId) {
        this.goalId = goalId;
    }

    public String getGoalTitle() {
        return goalTitle;
    }

    public void setGoalTitle(String goalTitle) {
        this.goalTitle = goalTitle;
    }

    public LocalDate getProgressDate() {
        return progressDate;
    }

    public void setProgressDate(LocalDate progressDate) {
        this.progressDate = progressDate;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
}
