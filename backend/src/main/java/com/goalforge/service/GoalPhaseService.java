package com.goalforge.service;

import com.goalforge.dto.GoalPhaseDto;
import com.goalforge.entity.Goal;
import com.goalforge.entity.GoalPhase;
import com.goalforge.entity.User;
import com.goalforge.exception.ResourceNotFoundException;
import com.goalforge.repository.GoalPhaseRepository;
import com.goalforge.repository.GoalRepository;
import com.goalforge.repository.TaskRepository;
import com.goalforge.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class GoalPhaseService {

    private final GoalPhaseRepository goalPhaseRepository;
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public GoalPhaseService(GoalPhaseRepository goalPhaseRepository,
                            GoalRepository goalRepository,
                            UserRepository userRepository,
                            TaskRepository taskRepository) {
        this.goalPhaseRepository = goalPhaseRepository;
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    private Goal getGoalForUser(Long goalId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + goalId));
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to access this goal.");
        }
        return goal;
    }

    private GoalPhase getPhaseWithOwnershipCheck(Long phaseId, Goal goal) {
        GoalPhase phase = goalPhaseRepository.findById(phaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Phase not found with id: " + phaseId));
        if (!phase.getGoal().getId().equals(goal.getId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to access this phase.");
        }
        return phase;
    }

    public GoalPhaseDto getPhaseById(Long phaseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        GoalPhase phase = goalPhaseRepository.findById(phaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Phase not found with id: " + phaseId));
        if (!phase.getGoal().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to access this phase.");
        }
        return toDto(phase);
    }

    public void recalculateGoalProgress(Goal goal) {
        List<GoalPhase> phases = goalPhaseRepository.findByGoalOrderByPhaseOrderAsc(goal);
        if (phases.isEmpty()) {
            goal.setProgress(0);
            goal.setStatus("Not Started");
            goalRepository.save(goal);
            return;
        }

        int totalPhases = phases.size();
        int sumProgress = phases.stream().mapToInt(GoalPhase::getProgressPercentage).sum();
        int avgProgress = Math.round((float) sumProgress / totalPhases);
        int clampedProgress = Math.min(100, Math.max(0, avgProgress));

        goal.setProgress(clampedProgress);

        if (clampedProgress == 100) {
            goal.setStatus("Completed");
        } else if (clampedProgress > 0) {
            goal.setStatus("In Progress");
        } else {
            boolean allNotStarted = phases.stream().allMatch(p -> "Not Started".equalsIgnoreCase(p.getStatus()));
            goal.setStatus(allNotStarted ? "Not Started" : "In Progress");
        }

        goalRepository.save(goal);
    }

    public List<GoalPhaseDto> getPhasesByGoal(Long goalId, String userEmail) {
        Goal goal = getGoalForUser(goalId, userEmail);
        return goalPhaseRepository.findByGoalOrderByPhaseOrderAsc(goal).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public GoalPhaseDto addPhase(Long goalId, GoalPhaseDto dto, String userEmail) {
        if (dto.getPhaseName() == null || dto.getPhaseName().isBlank()) {
            throw new IllegalArgumentException("Phase name is required");
        }

        Goal goal = getGoalForUser(goalId, userEmail);
        List<GoalPhase> existingPhases = goalPhaseRepository.findByGoalOrderByPhaseOrderAsc(goal);
        int nextOrder = existingPhases.size() + 1;

        int progress = dto.getProgressPercentage() != null ? Math.min(100, Math.max(0, dto.getProgressPercentage())) : 0;
        String status = dto.getStatus();
        if (status == null || status.isBlank()) {
            status = progress == 100 ? "Completed" : progress > 0 ? "In Progress" : "Not Started";
        }

        GoalPhase phase = new GoalPhase(
                goal,
                dto.getPhaseName().trim(),
                dto.getDescription() != null ? dto.getDescription().trim() : null,
                nextOrder,
                status,
                progress
        );

        GoalPhase saved = goalPhaseRepository.save(phase);
        recalculateGoalProgress(goal);
        return toDto(saved);
    }

    public GoalPhaseDto updatePhase(Long goalId, Long phaseId, GoalPhaseDto dto, String userEmail) {
        Goal goal = getGoalForUser(goalId, userEmail);
        GoalPhase phase = getPhaseWithOwnershipCheck(phaseId, goal);

        if (dto.getPhaseName() != null && !dto.getPhaseName().isBlank()) {
            phase.setPhaseName(dto.getPhaseName().trim());
        }
        if (dto.getDescription() != null) {
            phase.setDescription(dto.getDescription().trim());
        }
        if (dto.getPhaseOrder() != null) {
            phase.setPhaseOrder(dto.getPhaseOrder());
        }
        if (dto.getProgressPercentage() != null) {
            int p = Math.min(100, Math.max(0, dto.getProgressPercentage()));
            phase.setProgressPercentage(p);
            if (dto.getStatus() == null || dto.getStatus().isBlank()) {
                phase.setStatus(p == 100 ? "Completed" : p > 0 ? "In Progress" : "Not Started");
            }
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            phase.setStatus(dto.getStatus());
            if ("Completed".equalsIgnoreCase(dto.getStatus()) && phase.getProgressPercentage() < 100) {
                phase.setProgressPercentage(100);
            } else if ("Not Started".equalsIgnoreCase(dto.getStatus()) && phase.getProgressPercentage() == 100) {
                phase.setProgressPercentage(0);
            }
        }

        GoalPhase updated = goalPhaseRepository.save(phase);
        recalculateGoalProgress(goal);
        return toDto(updated);
    }

    public GoalPhaseDto togglePhaseComplete(Long goalId, Long phaseId, String userEmail) {
        Goal goal = getGoalForUser(goalId, userEmail);
        GoalPhase phase = getPhaseWithOwnershipCheck(phaseId, goal);

        boolean isCompleted = "Completed".equalsIgnoreCase(phase.getStatus()) || phase.getProgressPercentage() == 100;
        if (isCompleted) {
            phase.setStatus("In Progress");
            phase.setProgressPercentage(0);
        } else {
            phase.setStatus("Completed");
            phase.setProgressPercentage(100);
        }

        GoalPhase updated = goalPhaseRepository.save(phase);
        recalculateGoalProgress(goal);
        return toDto(updated);
    }

    public void deletePhase(Long goalId, Long phaseId, String userEmail) {
        Goal goal = getGoalForUser(goalId, userEmail);
        GoalPhase phase = getPhaseWithOwnershipCheck(phaseId, goal);

        // Delete all tasks in this phase first to avoid foreign key violations
        taskRepository.deleteByPhase(phase);

        goalPhaseRepository.delete(phase);

        // Re-index remaining phases
        List<GoalPhase> remaining = goalPhaseRepository.findByGoalOrderByPhaseOrderAsc(goal);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setPhaseOrder(i + 1);
        }
        goalPhaseRepository.saveAll(remaining);

        recalculateGoalProgress(goal);
    }

    public List<GoalPhaseDto> reorderPhases(Long goalId, List<Long> phaseIds, String userEmail) {
        Goal goal = getGoalForUser(goalId, userEmail);
        List<GoalPhase> phases = goalPhaseRepository.findByGoalOrderByPhaseOrderAsc(goal);

        for (int order = 0; order < phaseIds.size(); order++) {
            Long pid = phaseIds.get(order);
            Optional<GoalPhase> match = phases.stream().filter(p -> p.getId().equals(pid)).findFirst();
            if (match.isPresent()) {
                match.get().setPhaseOrder(order + 1);
            }
        }

        goalPhaseRepository.saveAll(phases);
        return goalPhaseRepository.findByGoalOrderByPhaseOrderAsc(goal).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public GoalPhaseDto updatePhaseDirect(Long phaseId, GoalPhaseDto dto, String userEmail) {
        GoalPhase phase = goalPhaseRepository.findById(phaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Phase not found with id: " + phaseId));
        if (phase.getGoal() == null || phase.getGoal().getUser() == null ||
                !phase.getGoal().getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Access denied: You do not have permission to modify this phase.");
        }
        return updatePhase(phase.getGoal().getId(), phaseId, dto, userEmail);
    }

    public void deletePhaseDirect(Long phaseId, String userEmail) {
        GoalPhase phase = goalPhaseRepository.findById(phaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Phase not found with id: " + phaseId));
        if (phase.getGoal() == null || phase.getGoal().getUser() == null ||
                !phase.getGoal().getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Access denied: You do not have permission to delete this phase.");
        }
        deletePhase(phase.getGoal().getId(), phaseId, userEmail);
    }

    private GoalPhaseDto toDto(GoalPhase phase) {
        return new GoalPhaseDto(
                phase.getId(),
                phase.getGoal() != null ? phase.getGoal().getId() : null,
                phase.getPhaseName(),
                phase.getDescription(),
                phase.getPhaseOrder(),
                phase.getStatus(),
                phase.getProgressPercentage(),
                phase.getCreatedAt(),
                phase.getUpdatedAt()
        );
    }
}
