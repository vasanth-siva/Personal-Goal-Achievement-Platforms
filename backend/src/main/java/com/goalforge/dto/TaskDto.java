package com.goalforge.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDto {

    private Long id;
    private Long phaseId;
    private Long goalId;
    private String goalTitle;
    private String phaseName;

    @Size(max = 200, message = "Task title must not exceed 200 characters")
    private String title;

    @Size(max = 1000, message = "Task description must not exceed 1000 characters")
    private String description;

    private LocalDate dueDate;
    private String priority = "Medium"; // Low, Medium, High
    private String status = "Pending"; // Pending, In Progress, Completed
    private Boolean completed = false;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TaskDto() {
    }

    public TaskDto(Long id, Long phaseId, String title, String description, LocalDate dueDate, String priority, String status, Boolean completed, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.phaseId = phaseId;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority != null ? priority : "Medium";
        this.status = status != null ? status : "Pending";
        this.completed = completed != null ? completed : false;
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

    public Long getPhaseId() {
        return phaseId;
    }

    public void setPhaseId(Long phaseId) {
        this.phaseId = phaseId;
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

    public String getPhaseName() {
        return phaseName;
    }

    public void setPhaseName(String phaseName) {
        this.phaseName = phaseName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
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
