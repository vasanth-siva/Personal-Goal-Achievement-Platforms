package com.goalforge.service;

import com.goalforge.dto.DailyProgressDto;
import com.goalforge.dto.ProgressStatisticsDto;
import com.goalforge.dto.ProgressStatisticsDto.*;
import com.goalforge.entity.*;
import com.goalforge.exception.ResourceNotFoundException;
import com.goalforge.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class DailyProgressService {

    private final DailyProgressRepository dailyProgressRepository;
    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final GoalPhaseRepository goalPhaseRepository;
    private final TaskRepository taskRepository;

    public DailyProgressService(DailyProgressRepository dailyProgressRepository,
                                UserRepository userRepository,
                                GoalRepository goalRepository,
                                GoalPhaseRepository goalPhaseRepository,
                                TaskRepository taskRepository) {
        this.dailyProgressRepository = dailyProgressRepository;
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
        this.goalPhaseRepository = goalPhaseRepository;
        this.taskRepository = taskRepository;
    }

    private User getUserByEmail(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
    }

    public DailyProgressDto createLog(DailyProgressDto dto, String userEmail) {
        User user = getUserByEmail(userEmail);

        Goal goal = null;
        if (dto.getGoalId() != null) {
            Goal g = goalRepository.findById(dto.getGoalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + dto.getGoalId()));
            if (!g.getUser().getId().equals(user.getId())) {
                throw new AccessDeniedException("Access denied: You do not have permission to log progress for another user's goal.");
            }
            goal = g;
        }

        LocalDate progressDate = dto.getProgressDate() != null ? dto.getProgressDate() : LocalDate.now();
        int percentage = dto.getProgressPercentage() != null ? Math.min(100, Math.max(0, dto.getProgressPercentage())) : 0;

        DailyProgress progress = new DailyProgress(
                user,
                goal,
                progressDate,
                percentage,
                dto.getNotes() != null ? dto.getNotes().trim() : null
        );

        DailyProgress saved = dailyProgressRepository.save(progress);
        return toDto(saved);
    }

    public List<DailyProgressDto> getLogsByUser(String userEmail) {
        User user = getUserByEmail(userEmail);
        return dailyProgressRepository.findByUserOrderByProgressDateDescCreatedAtDesc(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public DailyProgressDto getLogById(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        DailyProgress progress = dailyProgressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Progress log not found with id: " + id));
        if (!progress.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to access this progress log.");
        }
        return toDto(progress);
    }

    public DailyProgressDto updateLog(Long id, DailyProgressDto dto, String userEmail) {
        User user = getUserByEmail(userEmail);
        DailyProgress progress = dailyProgressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Progress log not found with id: " + id));
        if (!progress.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to modify this progress log.");
        }

        if (dto.getProgressDate() != null) {
            progress.setProgressDate(dto.getProgressDate());
        }
        if (dto.getProgressPercentage() != null) {
            progress.setProgressPercentage(Math.min(100, Math.max(0, dto.getProgressPercentage())));
        }
        if (dto.getNotes() != null) {
            progress.setNotes(dto.getNotes().trim());
        }
        if (dto.getGoalId() != null) {
            Goal g = goalRepository.findById(dto.getGoalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + dto.getGoalId()));
            if (!g.getUser().getId().equals(user.getId())) {
                throw new AccessDeniedException("Access denied: You do not have permission to link to another user's goal.");
            }
            progress.setGoal(g);
        }

        DailyProgress updated = dailyProgressRepository.save(progress);
        return toDto(updated);
    }

    public void deleteLog(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        DailyProgress progress = dailyProgressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Progress log not found with id: " + id));
        if (!progress.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to delete this progress log.");
        }
        dailyProgressRepository.delete(progress);
    }

    public ProgressStatisticsDto calculateProgressStatistics(String userEmail) {
        User user = getUserByEmail(userEmail);

        List<Goal> goals = goalRepository.findByUser(user);
        List<DailyProgress> allLogs = dailyProgressRepository.findByUserOrderByProgressDateDescCreatedAtDesc(user);

        // Gather all user tasks across all phases of goals
        List<Task> allTasks = new ArrayList<>();
        for (Goal goal : goals) {
            List<GoalPhase> phases = goalPhaseRepository.findByGoalOrderByPhaseOrderAsc(goal);
            for (GoalPhase phase : phases) {
                allTasks.addAll(taskRepository.findByPhase(phase));
            }
        }

        ProgressStatisticsDto stats = new ProgressStatisticsDto();
        LocalDate today = LocalDate.now();

        // 1. Overall Goal Progress (%)
        if (goals.isEmpty()) {
            stats.setOverallGoalProgress(0.0);
        } else {
            double avgProgress = goals.stream().mapToInt(Goal::getProgress).average().orElse(0.0);
            stats.setOverallGoalProgress(roundOneDecimal(avgProgress));
        }

        // 2. Daily Progress (%)
        List<DailyProgress> todayLogs = allLogs.stream()
                .filter(l -> l.getProgressDate().equals(today))
                .collect(Collectors.toList());
        if (!todayLogs.isEmpty()) {
            double todayAvg = todayLogs.stream().mapToInt(DailyProgress::getProgressPercentage).average().orElse(0.0);
            stats.setDailyProgress(roundOneDecimal(todayAvg));
        } else if (!allLogs.isEmpty()) {
            // Most recent log percentage if today has not been logged yet
            stats.setDailyProgress(roundOneDecimal(allLogs.get(0).getProgressPercentage().doubleValue()));
        } else {
            stats.setDailyProgress(stats.getOverallGoalProgress());
        }

        // 3. Weekly Progress (%)
        LocalDate sevenDaysAgo = today.minusDays(6);
        List<DailyProgress> weekLogs = allLogs.stream()
                .filter(l -> !l.getProgressDate().isBefore(sevenDaysAgo) && !l.getProgressDate().isAfter(today))
                .collect(Collectors.toList());
        if (!weekLogs.isEmpty()) {
            double weekAvg = weekLogs.stream().mapToInt(DailyProgress::getProgressPercentage).average().orElse(0.0);
            stats.setWeeklyProgress(roundOneDecimal(weekAvg));
        } else {
            stats.setWeeklyProgress(stats.getOverallGoalProgress());
        }

        // 4. Monthly Progress (%)
        LocalDate thirtyDaysAgo = today.minusDays(29);
        List<DailyProgress> monthLogs = allLogs.stream()
                .filter(l -> !l.getProgressDate().isBefore(thirtyDaysAgo) && !l.getProgressDate().isAfter(today))
                .collect(Collectors.toList());
        if (!monthLogs.isEmpty()) {
            double monthAvg = monthLogs.stream().mapToInt(DailyProgress::getProgressPercentage).average().orElse(0.0);
            stats.setMonthlyProgress(roundOneDecimal(monthAvg));
        } else {
            stats.setMonthlyProgress(stats.getOverallGoalProgress());
        }

        // 5. Task Completion Rate (%)
        long completedTasksCount = allTasks.stream()
                .filter(t -> Boolean.TRUE.equals(t.getCompleted()) || "Completed".equalsIgnoreCase(t.getStatus()))
                .count();
        int totalTasksCount = allTasks.size();
        if (totalTasksCount == 0) {
            stats.setTaskCompletionRate(0.0);
        } else {
            double rate = ((double) completedTasksCount / totalTasksCount) * 100.0;
            stats.setTaskCompletionRate(roundOneDecimal(rate));
        }

        // 6 & 7. Current Streak and Best Streak (Consecutive days)
        Set<LocalDate> activeDates = new HashSet<>();
        for (DailyProgress log : allLogs) {
            activeDates.add(log.getProgressDate());
        }
        for (Task task : allTasks) {
            if (Boolean.TRUE.equals(task.getCompleted()) || "Completed".equalsIgnoreCase(task.getStatus())) {
                if (task.getUpdatedAt() != null) {
                    activeDates.add(task.getUpdatedAt().toLocalDate());
                } else if (task.getCreatedAt() != null) {
                    activeDates.add(task.getCreatedAt().toLocalDate());
                }
            }
        }

        int currentStreak = 0;
        LocalDate streakCursor = today;
        if (!activeDates.contains(streakCursor)) {
            streakCursor = today.minusDays(1);
        }
        while (activeDates.contains(streakCursor)) {
            currentStreak++;
            streakCursor = streakCursor.minusDays(1);
        }
        stats.setCurrentStreak(currentStreak);

        // Best streak calculation
        List<LocalDate> sortedDates = activeDates.stream().sorted().collect(Collectors.toList());
        int bestStreak = 0;
        int runningStreak = 0;
        LocalDate prev = null;
        for (LocalDate d : sortedDates) {
            if (prev == null) {
                runningStreak = 1;
            } else if (prev.plusDays(1).equals(d)) {
                runningStreak++;
            } else {
                runningStreak = 1;
            }
            if (runningStreak > bestStreak) {
                bestStreak = runningStreak;
            }
            prev = d;
        }
        stats.setBestStreak(Math.max(bestStreak, currentStreak));

        // 8. Weekly Progress Line Chart (7 days)
        List<DailyPoint> weeklyPoints = new ArrayList<>();
        DateTimeFormatter df = DateTimeFormatter.ofPattern("MMM d");
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String dayOfWeek = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            String label = d.format(df);

            List<DailyProgress> dayLogs = allLogs.stream()
                    .filter(l -> l.getProgressDate().equals(d))
                    .collect(Collectors.toList());

            int progressVal;
            if (!dayLogs.isEmpty()) {
                progressVal = (int) Math.round(dayLogs.stream().mapToInt(DailyProgress::getProgressPercentage).average().orElse(0.0));
            } else {
                // If active date from tasks or interpolate smoothly
                progressVal = activeDates.contains(d) ? Math.max(10, (int) Math.round(stats.getWeeklyProgress())) : 0;
            }

            weeklyPoints.add(new DailyPoint(label, dayOfWeek, progressVal));
        }
        stats.setWeeklyTrend(weeklyPoints);

        // 9. Goal Completion Breakdown (Donut Chart)
        GoalCompletionData gcd = new GoalCompletionData();
        gcd.setTotalGoals(goals.size());
        int completedGoals = (int) goals.stream().filter(g -> "Completed".equalsIgnoreCase(g.getStatus()) || g.getProgress() == 100).count();
        int inProgressGoals = (int) goals.stream().filter(g -> "In Progress".equalsIgnoreCase(g.getStatus()) || (g.getProgress() > 0 && g.getProgress() < 100)).count();
        int notStartedGoals = goals.size() - completedGoals - inProgressGoals;
        gcd.setCompletedGoals(completedGoals);
        gcd.setInProgressGoals(inProgressGoals);
        gcd.setNotStartedGoals(Math.max(0, notStartedGoals));

        List<GoalItemSummary> goalSummaries = goals.stream()
                .map(g -> new GoalItemSummary(g.getId(), g.getTitle(), g.getCategory(), g.getProgress(), g.getStatus()))
                .collect(Collectors.toList());
        gcd.setGoals(goalSummaries);
        stats.setGoalCompletionData(gcd);

        // 10. Task Completion Data (Bar Chart)
        TaskCompletionData tcd = new TaskCompletionData();
        tcd.setTotalTasks(totalTasksCount);
        tcd.setCompletedTasks((int) completedTasksCount);
        tcd.setPendingTasks(totalTasksCount - (int) completedTasksCount);

        List<TaskDayPoint> taskDays = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String dayName = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            long completedOnDay = allTasks.stream()
                    .filter(t -> (Boolean.TRUE.equals(t.getCompleted()) || "Completed".equalsIgnoreCase(t.getStatus()))
                            && t.getUpdatedAt() != null && t.getUpdatedAt().toLocalDate().equals(d))
                    .count();

            long pendingOnDay = allTasks.stream()
                    .filter(t -> (!Boolean.TRUE.equals(t.getCompleted()) && !"Completed".equalsIgnoreCase(t.getStatus()))
                            && ((t.getDueDate() != null && t.getDueDate().equals(d)) || (t.getCreatedAt() != null && t.getCreatedAt().toLocalDate().equals(d))))
                    .count();

            taskDays.add(new TaskDayPoint(dayName, (int) completedOnDay, (int) pendingOnDay));
        }
        tcd.setTaskDays(taskDays);
        stats.setTaskCompletionData(tcd);

        // 11. Monthly Activity Heatmap (30 days)
        List<MonthlyActivityPoint> monthlyActivity = new ArrayList<>();
        for (int i = 29; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            List<DailyProgress> dayLogs = allLogs.stream().filter(l -> l.getProgressDate().equals(d)).collect(Collectors.toList());
            int logCount = dayLogs.size();
            int avgProg = logCount > 0 ? (int) Math.round(dayLogs.stream().mapToInt(DailyProgress::getProgressPercentage).average().orElse(0.0)) : 0;

            long tasksDone = allTasks.stream()
                    .filter(t -> (Boolean.TRUE.equals(t.getCompleted()) || "Completed".equalsIgnoreCase(t.getStatus()))
                            && t.getUpdatedAt() != null && t.getUpdatedAt().toLocalDate().equals(d))
                    .count();

            int activityLevel = 0;
            if (logCount > 0 || tasksDone > 0) {
                int totalPoints = logCount + (int) tasksDone + (avgProg / 25);
                if (totalPoints >= 5) activityLevel = 4;
                else if (totalPoints >= 3) activityLevel = 3;
                else if (totalPoints >= 2) activityLevel = 2;
                else activityLevel = 1;
            }

            monthlyActivity.add(new MonthlyActivityPoint(
                    d.toString(),
                    avgProg,
                    logCount,
                    (int) tasksDone,
                    activityLevel
            ));
        }
        stats.setMonthlyActivity(monthlyActivity);

        // 12. Recent Logs
        stats.setRecentLogs(allLogs.stream().limit(10).map(this::toDto).collect(Collectors.toList()));

        return stats;
    }

    private double roundOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private DailyProgressDto toDto(DailyProgress entity) {
        return new DailyProgressDto(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getGoal() != null ? entity.getGoal().getId() : null,
                entity.getGoal() != null ? entity.getGoal().getTitle() : "General Progress",
                entity.getProgressDate(),
                entity.getProgressPercentage(),
                entity.getNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
