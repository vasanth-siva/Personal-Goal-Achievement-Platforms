package com.goalforge.controller;

import com.goalforge.dto.ApiResponse;
import com.goalforge.dto.TaskDto;
import com.goalforge.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getAllTasks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            Authentication authentication) {

        String userEmail = authentication.getName();
        List<TaskDto> tasks = taskService.getAllTasksForUser(search, status, priority, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("All tasks retrieved successfully", tasks));
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> getTask(
            @PathVariable Long id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        TaskDto task = taskService.getTaskById(id, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Task retrieved successfully", task));
    }

    @GetMapping("/phases/{phaseId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getTasksByPhase(
            @PathVariable Long phaseId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String sort,
            Authentication authentication) {

        String userEmail = authentication.getName();
        List<TaskDto> tasks = taskService.getTasksByPhase(phaseId, search, status, priority, sort, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Tasks retrieved successfully", tasks));
    }

    @PostMapping("/phases/{phaseId}/tasks")
    public ResponseEntity<ApiResponse<TaskDto>> createTask(
            @PathVariable Long phaseId,
            @Valid @RequestBody TaskDto dto,
            Authentication authentication) {

        String userEmail = authentication.getName();
        TaskDto created = taskService.createTask(phaseId, dto, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Task created successfully", created));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskDto dto,
            Authentication authentication) {

        String userEmail = authentication.getName();
        TaskDto updated = taskService.updateTask(id, dto, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Task updated successfully", updated));
    }

    @PatchMapping("/tasks/{id}/complete")
    public ResponseEntity<ApiResponse<TaskDto>> toggleTaskComplete(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") Boolean completed,
            Authentication authentication) {

        String userEmail = authentication.getName();
        TaskDto updateDto = new TaskDto();
        updateDto.setCompleted(completed);
        updateDto.setStatus(Boolean.TRUE.equals(completed) ? "Completed" : "Pending");
        TaskDto updated = taskService.updateTask(id, updateDto, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Task completion status updated", updated));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        taskService.deleteTask(id, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Task deleted successfully", null));
    }
}
