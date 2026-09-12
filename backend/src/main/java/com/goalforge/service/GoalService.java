package com.goalforge.service;

import com.goalforge.dto.GoalDto;
import com.goalforge.entity.Goal;
import com.goalforge.entity.GoalPhase;
import com.goalforge.entity.User;
import com.goalforge.exception.ResourceNotFoundException;
import com.goalforge.repository.DailyProgressRepository;
import com.goalforge.repository.GoalPhaseRepository;
import com.goalforge.repository.GoalRepository;
import com.goalforge.repository.TaskRepository;
import com.goalforge.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final GoalPhaseRepository goalPhaseRepository;
    private final TaskRepository taskRepository;
    private final DailyProgressRepository dailyProgressRepository;

    public GoalService(GoalRepository goalRepository,
                       UserRepository userRepository,
                       GoalPhaseRepository goalPhaseRepository,
                       TaskRepository taskRepository,
                       DailyProgressRepository dailyProgressRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.goalPhaseRepository = goalPhaseRepository;
        this.taskRepository = taskRepository;
        this.dailyProgressRepository = dailyProgressRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public List<GoalDto> getAllGoals(String userEmail, String category, String status, String priority, String search, String sort) {
        User user = getUserByEmail(userEmail);
        List<Goal> goals = goalRepository.findByUserOrderByCreatedAtDesc(user);

        return goals.stream()
                // Filter by category
                .filter(g -> {
                    if (category == null || category.isBlank() || category.equalsIgnoreCase("ALL")) return true;
                    return g.getCategory() != null && g.getCategory().equalsIgnoreCase(category);
                })
                // Filter by status
                .filter(g -> {
                    if (status == null || status.isBlank() || status.equalsIgnoreCase("ALL")) return true;
                    String s = g.getStatus() != null ? g.getStatus().replace(" ", "_").toUpperCase() : "";
                    String filterS = status.replace(" ", "_").toUpperCase();
                    return s.equals(filterS) || (g.getStatus() != null && g.getStatus().equalsIgnoreCase(status));
                })
                // Filter by priority
                .filter(g -> {
                    if (priority == null || priority.isBlank() || priority.equalsIgnoreCase("ALL")) return true;
                    return g.getPriority() != null && g.getPriority().equalsIgnoreCase(priority);
                })
                // Filter by search term in title or description
                .filter(g -> {
                    if (search == null || search.isBlank()) return true;
                    String query = search.toLowerCase();
                    boolean inTitle = g.getTitle() != null && g.getTitle().toLowerCase().contains(query);
                    boolean inDesc = g.getDescription() != null && g.getDescription().toLowerCase().contains(query);
                    return inTitle || inDesc;
                })
                // Sort
                .sorted(getComparator(sort))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private Goal getGoalWithOwnershipCheck(Long id, User user) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + id));
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to access this goal.");
        }
        return goal;
    }

    public GoalDto getGoalById(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Goal goal = getGoalWithOwnershipCheck(id, user);
        return toDto(goal);
    }

    public GoalDto createGoal(GoalDto dto, String userEmail) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (dto.getCategory() == null || dto.getCategory().isBlank()) {
            throw new IllegalArgumentException("Category is required");
        }

        User user = getUserByEmail(userEmail);

        Goal goal = new Goal();
        goal.setTitle(dto.getTitle());
        goal.setDescription(dto.getDescription());
        goal.setCategory(dto.getCategory());
        goal.setPriority(dto.getPriority() != null ? dto.getPriority() : "Medium");
        goal.setProgress(dto.getProgress() != null ? dto.getProgress() : 0);
        goal.setStatus(dto.getStatus() != null ? dto.getStatus() : "Not Started");
        goal.setStartDate(dto.getStartDate());
        goal.setTargetDate(dto.getTargetDate());
        goal.setUser(user);

        Goal saved = goalRepository.save(goal);
        return toDto(saved);
    }

    public GoalDto updateGoal(Long id, GoalDto dto, String userEmail) {
        User user = getUserByEmail(userEmail);
        Goal goal = getGoalWithOwnershipCheck(id, user);

        if (dto.getTitle() != null) goal.setTitle(dto.getTitle());
        if (dto.getDescription() != null) goal.setDescription(dto.getDescription());
        if (dto.getCategory() != null) goal.setCategory(dto.getCategory());
        if (dto.getPriority() != null) goal.setPriority(dto.getPriority());
        if (dto.getProgress() != null) {
            goal.setProgress(dto.getProgress());
            if (dto.getProgress() == 100 && (dto.getStatus() == null || dto.getStatus().isBlank())) {
                goal.setStatus("Completed");
            }
        }
        if (dto.getStatus() != null) goal.setStatus(dto.getStatus());
        if (dto.getStartDate() != null) goal.setStartDate(dto.getStartDate());
        if (dto.getTargetDate() != null) goal.setTargetDate(dto.getTargetDate());

        Goal updated = goalRepository.save(goal);
        return toDto(updated);
    }

    public void deleteGoal(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Goal goal = getGoalWithOwnershipCheck(id, user);

        // Cascading deletion: clean up daily progress logs, tasks in all phases, then phases, then goal
        List<com.goalforge.entity.DailyProgress> logs = dailyProgressRepository.findByUserAndGoalOrderByProgressDateDesc(user, goal);
        dailyProgressRepository.deleteAll(logs);

        List<GoalPhase> phases = goalPhaseRepository.findByGoalOrderByPhaseOrderAsc(goal);
        for (GoalPhase phase : phases) {
            taskRepository.deleteByPhase(phase);
        }
        goalPhaseRepository.deleteAll(phases);
        goalRepository.delete(goal);
    }

    private Comparator<Goal> getComparator(String sort) {
        if (sort == null || sort.isBlank()) {
            return (a, b) -> {
                if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                return b.getCreatedAt().compareTo(a.getCreatedAt()); // Newest first
            };
        }

        switch (sort.toLowerCase()) {
            case "targetdate_asc":
            case "deadline_asc":
                return Comparator.comparing(Goal::getTargetDate, Comparator.nullsLast(Comparator.naturalOrder()));
            case "targetdate_desc":
            case "deadline_desc":
                return Comparator.comparing(Goal::getTargetDate, Comparator.nullsLast(Comparator.reverseOrder()));
            case "progress_desc":
                return Comparator.comparing(Goal::getProgress, Comparator.nullsLast(Comparator.reverseOrder()));
            case "progress_asc":
                return Comparator.comparing(Goal::getProgress, Comparator.nullsLast(Comparator.naturalOrder()));
            case "priority_desc":
                return (a, b) -> Integer.compare(getPriorityRank(b.getPriority()), getPriorityRank(a.getPriority()));
            case "title_asc":
                return Comparator.comparing(Goal::getTitle, String.CASE_INSENSITIVE_ORDER);
            case "title_desc":
                return (a, b) -> String.CASE_INSENSITIVE_ORDER.compare(b.getTitle(), a.getTitle());
            default:
                return (a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                };
        }
    }

    private int getPriorityRank(String priority) {
        if (priority == null) return 0;
        switch (priority.toUpperCase()) {
            case "HIGH": return 3;
            case "MEDIUM": return 2;
            case "LOW": return 1;
            default: return 0;
        }
    }

    private GoalDto toDto(Goal goal) {
        return new GoalDto(
                goal.getId(),
                goal.getTitle(),
                goal.getDescription(),
                goal.getCategory(),
                goal.getPriority(),
                goal.getProgress(),
                goal.getStatus(),
                goal.getStartDate(),
                goal.getTargetDate(),
                goal.getUser() != null ? goal.getUser().getId() : null,
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }
}
