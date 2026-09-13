package com.goalforge.dto;

import java.util.ArrayList;
import java.util.List;

public class ProgressStatisticsDto {

    private Double overallGoalProgress = 0.0;
    private Double dailyProgress = 0.0;
    private Double weeklyProgress = 0.0;
    private Double monthlyProgress = 0.0;
    private Double taskCompletionRate = 0.0;
    private Integer currentStreak = 0;
    private Integer bestStreak = 0;

    // Charts Data
    private List<DailyPoint> weeklyTrend = new ArrayList<>();
    private GoalCompletionData goalCompletionData = new GoalCompletionData();
    private TaskCompletionData taskCompletionData = new TaskCompletionData();
    private List<MonthlyActivityPoint> monthlyActivity = new ArrayList<>();

    // Recent Notes / Logs
    private List<DailyProgressDto> recentLogs = new ArrayList<>();

    public ProgressStatisticsDto() {
    }

    public static class DailyPoint {
        private String date;
        private String dayOfWeek;
        private Integer progressPercentage;

        public DailyPoint() {
        }

        public DailyPoint(String date, String dayOfWeek, Integer progressPercentage) {
            this.date = date;
            this.dayOfWeek = dayOfWeek;
            this.progressPercentage = progressPercentage;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getDayOfWeek() {
            return dayOfWeek;
        }

        public void setDayOfWeek(String dayOfWeek) {
            this.dayOfWeek = dayOfWeek;
        }

        public Integer getProgressPercentage() {
            return progressPercentage;
        }

        public void setProgressPercentage(Integer progressPercentage) {
            this.progressPercentage = progressPercentage;
        }
    }

    public static class GoalCompletionData {
        private Integer totalGoals = 0;
        private Integer completedGoals = 0;
        private Integer inProgressGoals = 0;
        private Integer notStartedGoals = 0;
        private List<GoalItemSummary> goals = new ArrayList<>();

        public GoalCompletionData() {
        }

        public Integer getTotalGoals() {
            return totalGoals;
        }

        public void setTotalGoals(Integer totalGoals) {
            this.totalGoals = totalGoals;
        }

        public Integer getCompletedGoals() {
            return completedGoals;
        }

        public void setCompletedGoals(Integer completedGoals) {
            this.completedGoals = completedGoals;
        }

        public Integer getInProgressGoals() {
            return inProgressGoals;
        }

        public void setInProgressGoals(Integer inProgressGoals) {
            this.inProgressGoals = inProgressGoals;
        }

        public Integer getNotStartedGoals() {
            return notStartedGoals;
        }

        public void setNotStartedGoals(Integer notStartedGoals) {
            this.notStartedGoals = notStartedGoals;
        }

        public List<GoalItemSummary> getGoals() {
            return goals;
        }

        public void setGoals(List<GoalItemSummary> goals) {
            this.goals = goals;
        }
    }

    public static class GoalItemSummary {
        private Long id;
        private String title;
        private String category;
        private Integer progress;
        private String status;

        public GoalItemSummary() {
        }

        public GoalItemSummary(Long id, String title, String category, Integer progress, String status) {
            this.id = id;
            this.title = title;
            this.category = category;
            this.progress = progress;
            this.status = status;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public Integer getProgress() {
            return progress;
        }

        public void setProgress(Integer progress) {
            this.progress = progress;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class TaskCompletionData {
        private Integer totalTasks = 0;
        private Integer completedTasks = 0;
        private Integer pendingTasks = 0;
        private List<TaskDayPoint> taskDays = new ArrayList<>();

        public TaskCompletionData() {
        }

        public Integer getTotalTasks() {
            return totalTasks;
        }

        public void setTotalTasks(Integer totalTasks) {
            this.totalTasks = totalTasks;
        }

        public Integer getCompletedTasks() {
            return completedTasks;
        }

        public void setCompletedTasks(Integer completedTasks) {
            this.completedTasks = completedTasks;
        }

        public Integer getPendingTasks() {
            return pendingTasks;
        }

        public void setPendingTasks(Integer pendingTasks) {
            this.pendingTasks = pendingTasks;
        }

        public List<TaskDayPoint> getTaskDays() {
            return taskDays;
        }

        public void setTaskDays(List<TaskDayPoint> taskDays) {
            this.taskDays = taskDays;
        }
    }

    public static class TaskDayPoint {
        private String label;
        private Integer completed;
        private Integer pending;

        public TaskDayPoint() {
        }

        public TaskDayPoint(String label, Integer completed, Integer pending) {
            this.label = label;
            this.completed = completed;
            this.pending = pending;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public Integer getCompleted() {
            return completed;
        }

        public void setCompleted(Integer completed) {
            this.completed = completed;
        }

        public Integer getPending() {
            return pending;
        }

        public void setPending(Integer pending) {
            this.pending = pending;
        }
    }

    public static class MonthlyActivityPoint {
        private String date;
        private Integer progressPercentage;
        private Integer logsCount;
        private Integer tasksCompleted;
        private Integer activityLevel; // 0, 1, 2, 3, 4 for heatmap shading

        public MonthlyActivityPoint() {
        }

        public MonthlyActivityPoint(String date, Integer progressPercentage, Integer logsCount, Integer tasksCompleted, Integer activityLevel) {
            this.date = date;
            this.progressPercentage = progressPercentage;
            this.logsCount = logsCount;
            this.tasksCompleted = tasksCompleted;
            this.activityLevel = activityLevel;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public Integer getProgressPercentage() {
            return progressPercentage;
        }

        public void setProgressPercentage(Integer progressPercentage) {
            this.progressPercentage = progressPercentage;
        }

        public Integer getLogsCount() {
            return logsCount;
        }

        public void setLogsCount(Integer logsCount) {
            this.logsCount = logsCount;
        }

        public Integer getTasksCompleted() {
            return tasksCompleted;
        }

        public void setTasksCompleted(Integer tasksCompleted) {
            this.tasksCompleted = tasksCompleted;
        }

        public Integer getActivityLevel() {
            return activityLevel;
        }

        public void setActivityLevel(Integer activityLevel) {
            this.activityLevel = activityLevel;
        }
    }

    // Getters and Setters
    public Integer getTotalGoals() {
        return goalCompletionData != null ? goalCompletionData.getTotalGoals() : 0;
    }

    public Integer getCompletedGoals() {
        return goalCompletionData != null ? goalCompletionData.getCompletedGoals() : 0;
    }

    public Integer getTotalTasks() {
        return taskCompletionData != null ? taskCompletionData.getTotalTasks() : 0;
    }

    public Integer getCompletedTasks() {
        return taskCompletionData != null ? taskCompletionData.getCompletedTasks() : 0;
    }

    public Double getOverallGoalProgress() {
        return overallGoalProgress;
    }

    public void setOverallGoalProgress(Double overallGoalProgress) {
        this.overallGoalProgress = overallGoalProgress;
    }

    public Double getDailyProgress() {
        return dailyProgress;
    }

    public void setDailyProgress(Double dailyProgress) {
        this.dailyProgress = dailyProgress;
    }

    public Double getWeeklyProgress() {
        return weeklyProgress;
    }

    public void setWeeklyProgress(Double weeklyProgress) {
        this.weeklyProgress = weeklyProgress;
    }

    public Double getMonthlyProgress() {
        return monthlyProgress;
    }

    public void setMonthlyProgress(Double monthlyProgress) {
        this.monthlyProgress = monthlyProgress;
    }

    public Double getTaskCompletionRate() {
        return taskCompletionRate;
    }

    public void setTaskCompletionRate(Double taskCompletionRate) {
        this.taskCompletionRate = taskCompletionRate;
    }

    public Integer getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(Integer currentStreak) {
        this.currentStreak = currentStreak;
    }

    public Integer getBestStreak() {
        return bestStreak;
    }

    public void setBestStreak(Integer bestStreak) {
        this.bestStreak = bestStreak;
    }

    public List<DailyPoint> getWeeklyTrend() {
        return weeklyTrend;
    }

    public void setWeeklyTrend(List<DailyPoint> weeklyTrend) {
        this.weeklyTrend = weeklyTrend;
    }

    public GoalCompletionData getGoalCompletionData() {
        return goalCompletionData;
    }

    public void setGoalCompletionData(GoalCompletionData goalCompletionData) {
        this.goalCompletionData = goalCompletionData;
    }

    public TaskCompletionData getTaskCompletionData() {
        return taskCompletionData;
    }

    public void setTaskCompletionData(TaskCompletionData taskCompletionData) {
        this.taskCompletionData = taskCompletionData;
    }

    public List<MonthlyActivityPoint> getMonthlyActivity() {
        return monthlyActivity;
    }

    public void setMonthlyActivity(List<MonthlyActivityPoint> monthlyActivity) {
        this.monthlyActivity = monthlyActivity;
    }

    public List<DailyProgressDto> getRecentLogs() {
        return recentLogs;
    }

    public void setRecentLogs(List<DailyProgressDto> recentLogs) {
        this.recentLogs = recentLogs;
    }
}
