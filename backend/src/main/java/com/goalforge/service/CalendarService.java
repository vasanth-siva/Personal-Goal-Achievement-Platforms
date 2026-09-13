package com.goalforge.service;

import com.goalforge.dto.CalendarEventDto;
import com.goalforge.entity.*;
import com.goalforge.exception.ResourceNotFoundException;
import com.goalforge.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class CalendarService {

    public static final String TYPE_GOAL_DEADLINE = "GOAL_DEADLINE";
    public static final String TYPE_TASK_DEADLINE = "TASK_DEADLINE";
    public static final String TYPE_MILESTONE = "MILESTONE";
    public static final String TYPE_COMPLETED_TASK = "COMPLETED_TASK";

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final GoalPhaseRepository goalPhaseRepository;
    private final TaskRepository taskRepository;
    private final AchievementRepository achievementRepository;

    public CalendarService(UserRepository userRepository,
                           GoalRepository goalRepository,
                           GoalPhaseRepository goalPhaseRepository,
                           TaskRepository taskRepository,
                           AchievementRepository achievementRepository) {
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
        this.goalPhaseRepository = goalPhaseRepository;
        this.taskRepository = taskRepository;
        this.achievementRepository = achievementRepository;
    }

    public List<CalendarEventDto> getCalendarEvents(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        List<CalendarEventDto> events = new ArrayList<>();
        List<Goal> goals = goalRepository.findByUser(user);

        for (Goal goal : goals) {
            boolean goalIsCompleted = "Completed".equalsIgnoreCase(goal.getStatus()) ||
                    (goal.getProgress() != null && goal.getProgress() == 100);

            // 1. Goal Deadlines
            if (goal.getTargetDate() != null) {
                events.add(new CalendarEventDto(
                        "goal-" + goal.getId(),
                        "Target: " + goal.getTitle(),
                        goal.getTargetDate(),
                        TYPE_GOAL_DEADLINE,
                        goal.getCategory(),
                        goal.getPriority(),
                        goal.getStatus(),
                        goal.getId(),
                        goal.getTitle(),
                        goalIsCompleted,
                        goal.getDescription(),
                        "#6366f1"
                ));
            }

            // Inspect phases and tasks
            List<GoalPhase> phases = goalPhaseRepository.findByGoalOrderByPhaseOrderAsc(goal);
            for (GoalPhase phase : phases) {
                List<Task> tasks = taskRepository.findByPhase(phase);
                for (Task task : tasks) {
                    boolean isTaskDone = Boolean.TRUE.equals(task.getCompleted()) ||
                            "Completed".equalsIgnoreCase(task.getStatus());

                    if (isTaskDone) {
                        // 4. Completed Tasks
                        LocalDate completedDate = task.getUpdatedAt() != null ?
                                task.getUpdatedAt().toLocalDate() :
                                (task.getDueDate() != null ? task.getDueDate() : LocalDate.now());

                        events.add(new CalendarEventDto(
                                "completed-" + task.getId(),
                                "Done: " + task.getTitle(),
                                completedDate,
                                TYPE_COMPLETED_TASK,
                                goal.getCategory(),
                                task.getPriority(),
                                "Completed",
                                goal.getId(),
                                goal.getTitle(),
                                true,
                                task.getDescription(),
                                "#10b981"
                        ));
                    } else if (task.getDueDate() != null) {
                        // 2. Task Deadlines
                        events.add(new CalendarEventDto(
                                "task-" + task.getId(),
                                task.getTitle(),
                                task.getDueDate(),
                                TYPE_TASK_DEADLINE,
                                goal.getCategory(),
                                task.getPriority(),
                                task.getStatus(),
                                goal.getId(),
                                goal.getTitle(),
                                false,
                                task.getDescription(),
                                "#f59e0b"
                        ));
                    }
                }
            }
        }

        // 3. Milestones (Achievements & Milestone Targets)
        List<Achievement> achievements = achievementRepository.findByUserOrderByUnlockedAtDesc(user);
        for (Achievement a : achievements) {
            LocalDate date = a.getUnlockedAt() != null ? a.getUnlockedAt().toLocalDate() : LocalDate.now();
            events.add(new CalendarEventDto(
                    "milestone-" + a.getId(),
                    "Badge: " + a.getTitle(),
                    date,
                    TYPE_MILESTONE,
                    "Milestone",
                    "High",
                    "Unlocked",
                    null,
                    null,
                    true,
                    a.getDescription(),
                    "#eab308"
            ));
        }

        // Sort chronologically
        events.sort(Comparator.comparing(CalendarEventDto::getDate, Comparator.nullsLast(Comparator.naturalOrder())));

        return events;
    }
}
