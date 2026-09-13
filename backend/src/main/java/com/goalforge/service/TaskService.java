package com.goalforge.service;

import com.goalforge.dto.TaskDto;
import com.goalforge.entity.Goal;
import com.goalforge.entity.GoalPhase;
import com.goalforge.entity.Task;
import com.goalforge.exception.ResourceNotFoundException;
import com.goalforge.repository.GoalPhaseRepository;
import com.goalforge.repository.TaskRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final GoalPhaseRepository goalPhaseRepository;
    private final GoalPhaseService goalPhaseService;

    public TaskService(TaskRepository taskRepository,
                       GoalPhaseRepository goalPhaseRepository,
                       GoalPhaseService goalPhaseService) {
        this.taskRepository = taskRepository;
        this.goalPhaseRepository = goalPhaseRepository;
        this.goalPhaseService = goalPhaseService;
    }

    private GoalPhase getPhaseForUser(Long phaseId, String userEmail) {
        GoalPhase phase = goalPhaseRepository.findById(phaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Phase not found with id: " + phaseId));

        Goal goal = phase.getGoal();
        if (goal == null || goal.getUser() == null || !goal.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Access denied: You do not have permission to access this phase.");
        }
        return phase;
    }

    private Task getTaskForUser(Long taskId, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        GoalPhase phase = task.getPhase();
        if (phase == null || phase.getGoal() == null || phase.getGoal().getUser() == null ||
                !phase.getGoal().getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Access denied: You do not have permission to access this task.");
        }
        return task;
    }

    public TaskDto getTaskById(Long taskId, String userEmail) {
        Task task = getTaskForUser(taskId, userEmail);
        return toDto(task);
    }

    public void recalculatePhaseAndGoalProgress(GoalPhase phase) {
        List<Task> tasks = taskRepository.findByPhase(phase);
        if (!tasks.isEmpty()) {
            long completedCount = tasks.stream()
                    .filter(t -> Boolean.TRUE.equals(t.getCompleted()) || "Completed".equalsIgnoreCase(t.getStatus()))
                    .count();

            int phaseProgress = Math.round(((float) completedCount / tasks.size()) * 100);
            int clamped = Math.min(100, Math.max(0, phaseProgress));
            phase.setProgressPercentage(clamped);

            if (clamped == 100) {
                phase.setStatus("Completed");
            } else if (clamped > 0) {
                phase.setStatus("In Progress");
            } else {
                boolean anyInProgress = tasks.stream().anyMatch(t -> "In Progress".equalsIgnoreCase(t.getStatus()));
                phase.setStatus(anyInProgress ? "In Progress" : "Not Started");
            }

            goalPhaseRepository.save(phase);
        } else {
            phase.setProgressPercentage(0);
            phase.setStatus("Not Started");
            goalPhaseRepository.save(phase);
        }

        // Cascade update to parent Goal
        if (phase.getGoal() != null) {
            goalPhaseService.recalculateGoalProgress(phase.getGoal());
        }
    }

    public List<TaskDto> getTasksByPhase(Long phaseId, String search, String status, String priority, String sort, String userEmail) {
        GoalPhase phase = getPhaseForUser(phaseId, userEmail);
        List<Task> tasks = taskRepository.findByPhaseOrderByCreatedAtAsc(phase);

        return tasks.stream()
                // Search in title or description
                .filter(t -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.toLowerCase();
                    boolean inTitle = t.getTitle() != null && t.getTitle().toLowerCase().contains(q);
                    boolean inDesc = t.getDescription() != null && t.getDescription().toLowerCase().contains(q);
                    return inTitle || inDesc;
                })
                // Filter by status
                .filter(t -> {
                    if (status == null || status.isBlank() || status.equalsIgnoreCase("ALL")) return true;
                    return t.getStatus() != null && t.getStatus().equalsIgnoreCase(status);
                })
                // Filter by priority
                .filter(t -> {
                    if (priority == null || priority.isBlank() || priority.equalsIgnoreCase("ALL")) return true;
                    return t.getPriority() != null && t.getPriority().equalsIgnoreCase(priority);
                })
                // Sort
                .sorted(getComparator(sort))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public TaskDto createTask(Long phaseId, TaskDto dto, String userEmail) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Task title is required");
        }

        GoalPhase phase = getPhaseForUser(phaseId, userEmail);

        boolean isCompleted = Boolean.TRUE.equals(dto.getCompleted()) || "Completed".equalsIgnoreCase(dto.getStatus());
        String status = dto.getStatus();
        if (status == null || status.isBlank()) {
            status = isCompleted ? "Completed" : "Pending";
        }

        Task task = new Task(
                phase,
                dto.getTitle().trim(),
                dto.getDescription() != null ? dto.getDescription().trim() : null,
                dto.getDueDate(),
                dto.getPriority() != null ? dto.getPriority() : "Medium",
                status,
                isCompleted
        );

        Task saved = taskRepository.save(task);
        recalculatePhaseAndGoalProgress(phase);
        return toDto(saved);
    }

    public TaskDto updateTask(Long taskId, TaskDto dto, String userEmail) {
        Task task = getTaskForUser(taskId, userEmail);

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            task.setTitle(dto.getTitle().trim());
        }
        if (dto.getDescription() != null) {
            task.setDescription(dto.getDescription().trim());
        }
        if (dto.getDueDate() != null) {
            task.setDueDate(dto.getDueDate());
        }
        if (dto.getPriority() != null) {
            task.setPriority(dto.getPriority());
        }

        // Completion & Status sync
        if (dto.getCompleted() != null) {
            task.setCompleted(dto.getCompleted());
            if (dto.getCompleted()) {
                task.setStatus("Completed");
            } else if ("Completed".equalsIgnoreCase(task.getStatus())) {
                task.setStatus("In Progress");
            }
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            task.setStatus(dto.getStatus());
            if ("Completed".equalsIgnoreCase(dto.getStatus())) {
                task.setCompleted(true);
            } else {
                task.setCompleted(false);
            }
        }

        Task updated = taskRepository.save(task);
        recalculatePhaseAndGoalProgress(task.getPhase());
        return toDto(updated);
    }

    public void deleteTask(Long taskId, String userEmail) {
        Task task = getTaskForUser(taskId, userEmail);
        GoalPhase phase = task.getPhase();

        taskRepository.delete(task);
        recalculatePhaseAndGoalProgress(phase);
    }

    private Comparator<Task> getComparator(String sort) {
        if (sort == null || sort.isBlank()) {
            return Comparator.comparing(Task::getId);
        }

        switch (sort.toLowerCase()) {
            case "duedate_asc":
            case "deadline_asc":
                return Comparator.comparing(Task::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()));
            case "duedate_desc":
            case "deadline_desc":
                return Comparator.comparing(Task::getDueDate, Comparator.nullsLast(Comparator.reverseOrder()));
            case "priority_desc":
                return (a, b) -> Integer.compare(getPriorityRank(b.getPriority()), getPriorityRank(a.getPriority()));
            case "title_asc":
                return Comparator.comparing(Task::getTitle, String.CASE_INSENSITIVE_ORDER);
            default:
                return Comparator.comparing(Task::getId);
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

    public List<TaskDto> getAllTasksForUser(String search, String status, String priority, String userEmail) {
        List<Task> tasks = taskRepository.findAllByUserEmail(userEmail);
        return tasks.stream()
                .filter(t -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.toLowerCase();
                    boolean inTitle = t.getTitle() != null && t.getTitle().toLowerCase().contains(q);
                    boolean inDesc = t.getDescription() != null && t.getDescription().toLowerCase().contains(q);
                    return inTitle || inDesc;
                })
                .filter(t -> {
                    if (status == null || status.isBlank() || status.equalsIgnoreCase("ALL")) return true;
                    return t.getStatus() != null && t.getStatus().equalsIgnoreCase(status);
                })
                .filter(t -> {
                    if (priority == null || priority.isBlank() || priority.equalsIgnoreCase("ALL")) return true;
                    return t.getPriority() != null && t.getPriority().equalsIgnoreCase(priority);
                })
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private TaskDto toDto(Task task) {
        TaskDto dto = new TaskDto(
                task.getId(),
                task.getPhase() != null ? task.getPhase().getId() : null,
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.getPriority(),
                task.getStatus(),
                task.getCompleted(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
        if (task.getPhase() != null) {
            dto.setPhaseName(task.getPhase().getPhaseName());
            if (task.getPhase().getGoal() != null) {
                dto.setGoalId(task.getPhase().getGoal().getId());
                dto.setGoalTitle(task.getPhase().getGoal().getTitle());
            }
        }
        return dto;
    }
}
