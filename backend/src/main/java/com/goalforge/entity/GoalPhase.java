package com.goalforge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "goal_phases")
public class GoalPhase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;

    @Column(name = "phase_name", nullable = false)
    private String phaseName;

    @Column(length = 1000)
    private String description;

    @Column(name = "phase_order", nullable = false)
    private Integer phaseOrder = 1;

    @Column(nullable = false)
    private String status = "Not Started"; // Not Started, In Progress, Completed

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage = 0; // 0 to 100

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public GoalPhase() {
    }

    public GoalPhase(Goal goal, String phaseName, String description, Integer phaseOrder, String status, Integer progressPercentage) {
        this.goal = goal;
        this.phaseName = phaseName;
        this.description = description;
        this.phaseOrder = phaseOrder != null ? phaseOrder : 1;
        this.status = status != null ? status : "Not Started";
        this.progressPercentage = progressPercentage != null ? progressPercentage : 0;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.phaseOrder == null) this.phaseOrder = 1;
        if (this.status == null) this.status = "Not Started";
        if (this.progressPercentage == null) this.progressPercentage = 0;
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

    public Goal getGoal() {
        return goal;
    }

    public void setGoal(Goal goal) {
        this.goal = goal;
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
