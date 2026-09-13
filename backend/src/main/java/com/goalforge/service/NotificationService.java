package com.goalforge.service;

import com.goalforge.dto.NotificationDto;
import com.goalforge.dto.ProgressStatisticsDto;
import com.goalforge.entity.*;
import com.goalforge.exception.ResourceNotFoundException;
import com.goalforge.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    public static final String TYPE_TASK_DUE = "TASK_DUE";
    public static final String TYPE_GOAL_COMPLETED = "GOAL_COMPLETED";
    public static final String TYPE_STREAK = "STREAK";
    public static final String TYPE_ACHIEVEMENT = "ACHIEVEMENT";
    public static final String TYPE_SYSTEM = "SYSTEM";

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final GoalPhaseRepository goalPhaseRepository;
    private final TaskRepository taskRepository;
    private final DailyProgressService dailyProgressService;
    private final AchievementRepository achievementRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               GoalRepository goalRepository,
                               GoalPhaseRepository goalPhaseRepository,
                               TaskRepository taskRepository,
                               DailyProgressService dailyProgressService,
                               AchievementRepository achievementRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
        this.goalPhaseRepository = goalPhaseRepository;
        this.taskRepository = taskRepository;
        this.dailyProgressService = dailyProgressService;
        this.achievementRepository = achievementRepository;
    }

    public List<NotificationDto> getNotifications(String userEmail) {
        User user = getUser(userEmail);
        generateContextualNotifications(user);
        List<Notification> list = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public long getUnreadCount(String userEmail) {
        User user = getUser(userEmail);
        generateContextualNotifications(user);
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public NotificationDto getNotificationById(Long id, String userEmail) {
        User user = getUser(userEmail);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to access this notification.");
        }

        return mapToDto(notification);
    }

    public NotificationDto markAsRead(Long id, String userEmail) {
        User user = getUser(userEmail);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to modify this notification.");
        }

        notification.setIsRead(true);
        Notification updated = notificationRepository.save(notification);
        return mapToDto(updated);
    }

    public void markAllAsRead(String userEmail) {
        User user = getUser(userEmail);
        List<Notification> unread = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(Long id, String userEmail) {
        User user = getUser(userEmail);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to delete this notification.");
        }

        notificationRepository.delete(notification);
    }

    public void clearAll(String userEmail) {
        User user = getUser(userEmail);
        notificationRepository.deleteByUser(user);
    }

    public Notification createNotification(User user, String message, String type) {
        if (notificationRepository.existsByUserAndMessage(user, message)) {
            return null; // Prevent duplicates
        }
        Notification notification = new Notification(user, message, type, false, LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public void generateContextualNotifications(User user) {
        // 1. Task due tomorrow alert: "Your [title] task is due tomorrow."
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Goal> goals = goalRepository.findByUser(user);
        List<Task> allTasks = new ArrayList<>();
        for (Goal g : goals) {
            List<GoalPhase> phases = goalPhaseRepository.findByGoalOrderByPhaseOrderAsc(g);
            for (GoalPhase p : phases) {
                allTasks.addAll(taskRepository.findByPhase(p));
            }
        }

        for (Task task : allTasks) {
            if (Boolean.FALSE.equals(task.getCompleted()) &&
                    !"Completed".equalsIgnoreCase(task.getStatus()) &&
                    task.getDueDate() != null &&
                    task.getDueDate().equals(tomorrow)) {
                String msg = "Your " + task.getTitle() + " task is due tomorrow.";
                if (!notificationRepository.existsByUserAndMessage(user, msg)) {
                    createNotification(user, msg, TYPE_TASK_DUE);
                }
            }
        }

        // 2. Completed goals alert: "Congratulations! You completed a goal."
        for (Goal g : goals) {
            if ("Completed".equalsIgnoreCase(g.getStatus()) || (g.getProgress() != null && g.getProgress() == 100)) {
                String msg = "Congratulations! You completed a goal: " + g.getTitle() + ".";
                if (!notificationRepository.existsByUserAndMessage(user, msg)) {
                    createNotification(user, msg, TYPE_GOAL_COMPLETED);
                }
            }
        }

        // 3. Streak alert: "You're on a 7-day streak 🔥"
        try {
            ProgressStatisticsDto stats = dailyProgressService.calculateProgressStatistics(user.getEmail());
            int streak = Math.max(
                    stats.getCurrentStreak() != null ? stats.getCurrentStreak() : 0,
                    stats.getBestStreak() != null ? stats.getBestStreak() : 0
            );
            if (streak >= 7) {
                String msg = "You're on a " + streak + "-day streak 🔥";
                if (!notificationRepository.existsByUserAndMessage(user, msg)) {
                    createNotification(user, msg, TYPE_STREAK);
                }
            }
        } catch (Exception ignored) {
        }

        // 4. Achievement alerts
        try {
            List<Achievement> achievements = achievementRepository.findByUserOrderByUnlockedAtDesc(user);
            for (Achievement a : achievements) {
                String msg = "Achievement Unlocked: " + a.getTitle() + " - " + a.getDescription();
                if (!notificationRepository.existsByUserAndMessage(user, msg)) {
                    createNotification(user, msg, TYPE_ACHIEVEMENT);
                }
            }
        } catch (Exception ignored) {
        }

        // 5. Active goal progress updates
        for (Goal g : goals) {
            if (g.getProgress() != null && g.getProgress() > 0 && g.getProgress() < 100) {
                String msg = "Milestone update: " + g.getTitle() + " has reached " + g.getProgress() + "% completion!";
                if (!notificationRepository.existsByUserAndMessage(user, msg)) {
                    createNotification(user, msg, TYPE_SYSTEM);
                }
            }
        }
    }

    private User getUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
    }

    private NotificationDto mapToDto(Notification n) {
        String icon = "🔔";
        if (TYPE_TASK_DUE.equals(n.getType())) {
            icon = "⏰";
        } else if (TYPE_GOAL_COMPLETED.equals(n.getType())) {
            icon = "🏆";
        } else if (TYPE_STREAK.equals(n.getType())) {
            icon = "🔥";
        } else if (TYPE_ACHIEVEMENT.equals(n.getType())) {
            icon = "🎖️";
        }
        return new NotificationDto(
                n.getId(),
                n.getMessage(),
                n.getType(),
                n.getIsRead(),
                n.getCreatedAt(),
                icon
        );
    }
}
