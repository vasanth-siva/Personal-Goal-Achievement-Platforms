package com.goalforge.dto;

public class UpdatePreferencesRequest {

    private String themePreference;
    private Boolean notifyTaskDue;
    private Boolean notifyGoalCompleted;
    private Boolean notifyStreak;
    private Boolean notifyWeeklyDigest;

    public UpdatePreferencesRequest() {
    }

    public UpdatePreferencesRequest(String themePreference, Boolean notifyTaskDue, Boolean notifyGoalCompleted, Boolean notifyStreak, Boolean notifyWeeklyDigest) {
        this.themePreference = themePreference;
        this.notifyTaskDue = notifyTaskDue;
        this.notifyGoalCompleted = notifyGoalCompleted;
        this.notifyStreak = notifyStreak;
        this.notifyWeeklyDigest = notifyWeeklyDigest;
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
