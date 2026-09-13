package com.goalforge.service;

import com.goalforge.dto.AchievementDto;
import com.goalforge.dto.AchievementSummaryDto;
import com.goalforge.dto.ProgressStatisticsDto;
import com.goalforge.entity.*;
import com.goalforge.exception.ResourceNotFoundException;
import com.goalforge.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AchievementService {

    public static final String FIRST_GOAL_CREATED = "FIRST_GOAL_CREATED";
    public static final String FIRST_TASK_COMPLETED = "FIRST_TASK_COMPLETED";
    public static final String TEN_TASKS_COMPLETED = "TEN_TASKS_COMPLETED";
    public static final String SEVEN_DAY_STREAK = "SEVEN_DAY_STREAK";
    public static final String THIRTY_DAY_STREAK = "THIRTY_DAY_STREAK";
    public static final String FIRST_GOAL_COMPLETED = "FIRST_GOAL_COMPLETED";
    public static final String FIVE_GOALS_COMPLETED = "FIVE_GOALS_COMPLETED";

    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final GoalPhaseRepository goalPhaseRepository;
    private final TaskRepository taskRepository;
    private final DailyProgressService dailyProgressService;

    public AchievementService(AchievementRepository achievementRepository,
                              UserRepository userRepository,
                              GoalRepository goalRepository,
                              GoalPhaseRepository goalPhaseRepository,
                              TaskRepository taskRepository,
                              DailyProgressService dailyProgressService) {
        this.achievementRepository = achievementRepository;
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
        this.goalPhaseRepository = goalPhaseRepository;
        this.taskRepository = taskRepository;
        this.dailyProgressService = dailyProgressService;
    }

    private static class AchievementDef {
        String type;
        String title;
        String description;
        String icon;
        int target;
        String requirement;

        AchievementDef(String type, String title, String description, String icon, int target, String requirement) {
            this.type = type;
            this.title = title;
            this.description = description;
            this.icon = icon;
            this.target = target;
            this.requirement = requirement;
        }
    }

    private static final List<AchievementDef> DEFINITIONS = Arrays.asList(
            new AchievementDef(FIRST_GOAL_CREATED, "First Goal Created", "Created your very first personal target in GoalForge", "🎯", 1, "Create 1 goal"),
            new AchievementDef(FIRST_TASK_COMPLETED, "First Task Completed", "Marked your very first action step as completed", "✅", 1, "Complete 1 task"),
            new AchievementDef(TEN_TASKS_COMPLETED, "10 Tasks Completed", "Demonstrated execution mastery by completing 10 tasks", "⚡", 10, "Complete 10 tasks"),
            new AchievementDef(SEVEN_DAY_STREAK, "7 Day Streak", "Built relentless momentum with 7 consecutive active days", "🔥", 7, "Maintain a 7-day streak"),
            new AchievementDef(THIRTY_DAY_STREAK, "30 Day Streak", "Mastered habit consistency with 30 consecutive active days", "🌟", 30, "Maintain a 30-day streak"),
            new AchievementDef(FIRST_GOAL_COMPLETED, "First Goal Completed", "Reached the finish line on your first complete goal", "🏆", 1, "Reach 100% on 1 goal"),
            new AchievementDef(FIVE_GOALS_COMPLETED, "5 Goals Completed", "Accomplished 5 full personal milestone targets", "👑", 5, "Reach 100% on 5 goals")
    );

    public AchievementSummaryDto checkAndGetAchievements(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        // Evaluate actual user data from DB
        List<Goal> goals = goalRepository.findByUser(user);
        int totalGoals = goals.size();
        int completedGoals = (int) goals.stream()
                .filter(g -> "Completed".equalsIgnoreCase(g.getStatus()) || g.getProgress() == 100)
                .count();

        List<Task> allTasks = new ArrayList<>();
        for (Goal goal : goals) {
            List<GoalPhase> phases = goalPhaseRepository.findByGoalOrderByPhaseOrderAsc(goal);
            for (GoalPhase phase : phases) {
                allTasks.addAll(taskRepository.findByPhase(phase));
            }
        }
        int completedTasks = (int) allTasks.stream()
                .filter(t -> Boolean.TRUE.equals(t.getCompleted()) || "Completed".equalsIgnoreCase(t.getStatus()))
                .count();

        ProgressStatisticsDto stats = dailyProgressService.calculateProgressStatistics(userEmail);
        int maxStreak = Math.max(stats.getCurrentStreak() != null ? stats.getCurrentStreak() : 0,
                                 stats.getBestStreak() != null ? stats.getBestStreak() : 0);

        // Fetch existing unlocked records from DB
        List<Achievement> existingUnlocked = achievementRepository.findByUserOrderByUnlockedAtDesc(user);
        Map<String, Achievement> unlockedMap = existingUnlocked.stream()
                .collect(Collectors.toMap(Achievement::getAchievementType, a -> a, (a, b) -> a));

        List<AchievementDto> newlyUnlocked = new ArrayList<>();
        List<AchievementDto> allList = new ArrayList<>();
        List<AchievementDto> unlockedList = new ArrayList<>();
        List<AchievementDto> lockedList = new ArrayList<>();

        for (AchievementDef def : DEFINITIONS) {
            int currentVal = 0;
            switch (def.type) {
                case FIRST_GOAL_CREATED:
                    currentVal = totalGoals;
                    break;
                case FIRST_TASK_COMPLETED:
                case TEN_TASKS_COMPLETED:
                    currentVal = completedTasks;
                    break;
                case SEVEN_DAY_STREAK:
                case THIRTY_DAY_STREAK:
                    currentVal = maxStreak;
                    break;
                case FIRST_GOAL_COMPLETED:
                case FIVE_GOALS_COMPLETED:
                    currentVal = completedGoals;
                    break;
            }

            boolean conditionMet = currentVal >= def.target;
            boolean alreadyUnlocked = unlockedMap.containsKey(def.type);
            boolean justUnlocked = false;

            Achievement entity = unlockedMap.get(def.type);
            if (conditionMet && !alreadyUnlocked) {
                // Unlock automatically!
                entity = new Achievement(user, def.title, def.description, def.type, LocalDateTime.now());
                entity = achievementRepository.save(entity);
                alreadyUnlocked = true;
                justUnlocked = true;
            }

            int pct = Math.min(100, Math.max(0, (int) Math.round(((double) currentVal / def.target) * 100)));
            if (alreadyUnlocked) pct = 100;

            AchievementDto dto = new AchievementDto(
                    entity != null ? entity.getId() : null,
                    def.type,
                    def.title,
                    def.description,
                    def.icon,
                    alreadyUnlocked,
                    entity != null ? entity.getUnlockedAt() : null,
                    currentVal,
                    def.target,
                    pct,
                    def.requirement
            );

            allList.add(dto);
            if (alreadyUnlocked) {
                unlockedList.add(dto);
                if (justUnlocked) {
                    newlyUnlocked.add(dto);
                }
            } else {
                lockedList.add(dto);
            }
        }

        AchievementSummaryDto summary = new AchievementSummaryDto();
        summary.setTotalAchievements(DEFINITIONS.size());
        summary.setUnlockedCount(unlockedList.size());
        summary.setLockedCount(lockedList.size());
        summary.setCompletionPercentage(Math.round(((double) unlockedList.size() / DEFINITIONS.size()) * 1000.0) / 10.0);
        summary.setUnlocked(unlockedList);
        summary.setLocked(lockedList);
        summary.setAllAchievements(allList);
        summary.setNewlyUnlocked(newlyUnlocked);

        return summary;
    }

    public AchievementDto getAchievementById(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        Achievement entity = achievementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement not found with id: " + id));
        if (!entity.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not have permission to access this achievement.");
        }

        AchievementDef def = DEFINITIONS.stream()
                .filter(d -> d.type.equalsIgnoreCase(entity.getAchievementType()))
                .findFirst()
                .orElse(new AchievementDef(entity.getAchievementType(), entity.getTitle(), entity.getDescription(), "🏆", 1, ""));

        return new AchievementDto(
                entity.getId(),
                entity.getAchievementType(),
                entity.getTitle(),
                entity.getDescription(),
                def.icon,
                true,
                entity.getUnlockedAt(),
                def.target,
                def.target,
                100,
                def.requirement
        );
    }
}
