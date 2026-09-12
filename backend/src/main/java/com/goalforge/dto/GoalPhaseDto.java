package com.goalforge.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class GoalPhaseDto {

    private Long id;
    private Long goalId;

    @Size(max = 150, message = "Phase name must not exceed 150 characters")
    private String phaseName;

    @Size(max = 1000, message = "Phase description must not exceed 1000 characters")
    private String description;

    private Integer phaseOrder;
    private String status = "Not Started";

    @Min(value = 0, message = "Progress percentage cannot be negative")
    @Max(value = 100, message = "Progress percentage cannot exceed 100")
    private Integer progressPercentage = 0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public GoalPhaseDto() {
    }

    public GoalPhaseDto(Long id, Long goalId, String phaseName, String description, Integer phaseOrder, String status, Integer progressPercentage, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.goalId = goalId;
        this.phaseName = phaseName;
        this.description = description;
        this.phaseOrder = phaseOrder;
        this.status = status != null ? status : "Not Started";
        this.progressPercentage = progressPercentage != null ? progressPercentage : 0;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGoalId() {
        return goalId;
    }

    public void setGoalId(Long goalId) {
        this.goalId = goalId;
    }

    public String getPhaseName() {
        return phaseName;
    }

    public void setPhaseName(String phaseName) {
        this.phaseName = phaseName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPhaseOrder() {
        return phaseOrder;
    }

    public void setPhaseOrder(Integer phaseOrder) {
        this.phaseOrder = phaseOrder;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
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
