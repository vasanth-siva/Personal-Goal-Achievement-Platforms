package com.goalforge.dto;

import java.time.LocalDateTime;

public class AchievementDto {

    private Long id;
    private String achievementType;
    private String title;
    private String description;
    private String icon;
    private Boolean unlocked = false;
    private LocalDateTime unlockedAt;
    private Integer currentValue = 0;
    private Integer targetValue = 1;
    private Integer progressPercentage = 0;
    private String requirementText;

    public AchievementDto() {
    }

    public AchievementDto(Long id, String achievementType, String title, String description, String icon, Boolean unlocked, LocalDateTime unlockedAt, Integer currentValue, Integer targetValue, Integer progressPercentage, String requirementText) {
        this.id = id;
        this.achievementType = achievementType;
        this.title = title;
        this.description = description;
        this.icon = icon;
        this.unlocked = unlocked != null ? unlocked : false;
        this.unlockedAt = unlockedAt;
        this.currentValue = currentValue != null ? currentValue : 0;
        this.targetValue = targetValue != null ? targetValue : 1;
        this.progressPercentage = progressPercentage != null ? progressPercentage : 0;
        this.requirementText = requirementText;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAchievementType() {
        return achievementType;
    }

    public void setAchievementType(String achievementType) {
        this.achievementType = achievementType;
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

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Boolean getUnlocked() {
        return unlocked;
    }

    public void setUnlocked(Boolean unlocked) {
        this.unlocked = unlocked;
    }

    public LocalDateTime getUnlockedAt() {
        return unlockedAt;
    }

    public void setUnlockedAt(LocalDateTime unlockedAt) {
        this.unlockedAt = unlockedAt;
    }

    public Integer getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(Integer currentValue) {
        this.currentValue = currentValue;
    }

    public Integer getTargetValue() {
        return targetValue;
    }

    public void setTargetValue(Integer targetValue) {
        this.targetValue = targetValue;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getRequirementText() {
        return requirementText;
    }

    public void setRequirementText(String requirementText) {
        this.requirementText = requirementText;
    }
}
