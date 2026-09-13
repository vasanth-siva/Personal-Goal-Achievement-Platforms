package com.goalforge.dto;

import java.time.LocalDate;

public class CalendarEventDto {

    private String id;
    private String title;
    private LocalDate date;
    private String type; // GOAL_DEADLINE, TASK_DEADLINE, MILESTONE, COMPLETED_TASK
    private String category;
    private String priority;
    private String status;
    private Long goalId;
    private String goalTitle;
    private Boolean completed;
    private String details;
    private String color;

    public CalendarEventDto() {
    }

    public CalendarEventDto(String id, String title, LocalDate date, String type, String category,
                            String priority, String status, Long goalId, String goalTitle,
                            Boolean completed, String details, String color) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.type = type;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.goalId = goalId;
        this.goalTitle = goalTitle;
        this.completed = completed;
        this.details = details;
        this.color = color;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
