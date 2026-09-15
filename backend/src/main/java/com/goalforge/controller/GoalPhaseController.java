package com.goalforge.controller;

import com.goalforge.dto.ApiResponse;
import com.goalforge.dto.GoalPhaseDto;
import com.goalforge.dto.ReorderPhasesRequest;
import com.goalforge.service.GoalPhaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals/{goalId}/phases")
public class GoalPhaseController {

    private final GoalPhaseService goalPhaseService;

    public GoalPhaseController(GoalPhaseService goalPhaseService) {
        this.goalPhaseService = goalPhaseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalPhaseDto>>> getPhases(
            @PathVariable Long goalId,
            Authentication authentication) {

        String userEmail = authentication.getName();
        List<GoalPhaseDto> phases = goalPhaseService.getPhasesByGoal(goalId, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Phases retrieved successfully", phases));
    }

    @GetMapping("/{phaseId}")
    public ResponseEntity<ApiResponse<GoalPhaseDto>> getPhase(
            @PathVariable Long goalId,
            @PathVariable Long phaseId,
            Authentication authentication) {

        String userEmail = authentication.getName();
        // Verifies goal ownership
        goalPhaseService.getPhasesByGoal(goalId, userEmail);
        GoalPhaseDto phase = goalPhaseService.getPhaseById(phaseId, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Phase retrieved successfully", phase));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalPhaseDto>> addPhase(
            @PathVariable Long goalId,
            @Valid @RequestBody GoalPhaseDto dto,
            Authentication authentication) {

        String userEmail = authentication.getName();
        GoalPhaseDto created = goalPhaseService.addPhase(goalId, dto, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Phase created successfully", created));
    }

    @PutMapping("/{phaseId}")
    public ResponseEntity<ApiResponse<GoalPhaseDto>> updatePhase(
            @PathVariable Long goalId,
            @PathVariable Long phaseId,
            @Valid @RequestBody GoalPhaseDto dto,
            Authentication authentication) {

        String userEmail = authentication.getName();
        GoalPhaseDto updated = goalPhaseService.updatePhase(goalId, phaseId, dto, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Phase updated successfully", updated));
    }

    @PatchMapping("/{phaseId}/complete")
    public ResponseEntity<ApiResponse<GoalPhaseDto>> toggleComplete(
            @PathVariable Long goalId,
            @PathVariable Long phaseId,
            Authentication authentication) {

        String userEmail = authentication.getName();
        GoalPhaseDto updated = goalPhaseService.togglePhaseComplete(goalId, phaseId, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Phase status updated successfully", updated));
    }

    @DeleteMapping("/{phaseId}")
    public ResponseEntity<ApiResponse<Void>> deletePhase(
            @PathVariable Long goalId,
            @PathVariable Long phaseId,
            Authentication authentication) {

        String userEmail = authentication.getName();
        goalPhaseService.deletePhase(goalId, phaseId, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Phase deleted successfully", null));
    }

    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse<List<GoalPhaseDto>>> reorderPhases(
            @PathVariable Long goalId,
            @RequestBody ReorderPhasesRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        List<GoalPhaseDto> reordered = goalPhaseService.reorderPhases(goalId, request.getPhaseIds(), userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Phases reordered successfully", reordered));
    }
}
