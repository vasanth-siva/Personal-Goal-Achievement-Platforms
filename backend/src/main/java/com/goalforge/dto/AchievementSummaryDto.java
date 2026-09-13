package com.goalforge.dto;

import java.util.ArrayList;
import java.util.List;

public class AchievementSummaryDto {

    private Integer totalAchievements = 7;
    private Integer unlockedCount = 0;
    private Integer lockedCount = 0;
    private Double completionPercentage = 0.0;

    private List<AchievementDto> unlocked = new ArrayList<>();
    private List<AchievementDto> locked = new ArrayList<>();
    private List<AchievementDto> allAchievements = new ArrayList<>();
    private List<AchievementDto> newlyUnlocked = new ArrayList<>();

    public AchievementSummaryDto() {
    }

    public Integer getTotalAchievements() {
        return totalAchievements;
    }

    public void setTotalAchievements(Integer totalAchievements) {
        this.totalAchievements = totalAchievements;
    }

    public Integer getUnlockedCount() {
        return unlockedCount;
    }

    public void setUnlockedCount(Integer unlockedCount) {
        this.unlockedCount = unlockedCount;
    }

    public Integer getLockedCount() {
        return lockedCount;
    }

    public void setLockedCount(Integer lockedCount) {
        this.lockedCount = lockedCount;
    }

    public Double getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(Double completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public List<AchievementDto> getUnlocked() {
        return unlocked;
    }

    public void setUnlocked(List<AchievementDto> unlocked) {
        this.unlocked = unlocked;
    }

    public List<AchievementDto> getLocked() {
        return locked;
    }

    public void setLocked(List<AchievementDto> locked) {
        this.locked = locked;
    }

    public List<AchievementDto> getAllAchievements() {
        return allAchievements;
    }

    public void setAllAchievements(List<AchievementDto> allAchievements) {
        this.allAchievements = allAchievements;
    }

    public List<AchievementDto> getNewlyUnlocked() {
        return newlyUnlocked;
    }

    public void setNewlyUnlocked(List<AchievementDto> newlyUnlocked) {
        this.newlyUnlocked = newlyUnlocked;
    }
}
