package com.goalforge.controller;

import com.goalforge.dto.ApiResponse;
import com.goalforge.dto.GoalDto;
import com.goalforge.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalDto>>> getAllGoals(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            Authentication authentication) {

        String userEmail = authentication.getName();
        List<GoalDto> goals = goalService.getAllGoals(userEmail, category, status, priority, search, sort);
        return ResponseEntity.ok(ApiResponse.ok("Goals retrieved successfully", goals));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalDto>> getGoalById(
            @PathVariable Long id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        GoalDto goal = goalService.getGoalById(id, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Goal retrieved successfully", goal));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalDto>> createGoal(
            @Valid @RequestBody GoalDto goalDto,
            Authentication authentication) {

        String userEmail = authentication.getName();
        GoalDto created = goalService.createGoal(goalDto, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Goal created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalDto>> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody GoalDto goalDto,
            Authentication authentication) {

        String userEmail = authentication.getName();
        GoalDto updated = goalService.updateGoal(id, goalDto, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Goal updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @PathVariable Long id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        goalService.deleteGoal(id, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Goal deleted successfully", null));
    }
}
