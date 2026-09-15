package com.goalforge.controller;

import com.goalforge.dto.ApiResponse;
import com.goalforge.dto.GoalPhaseDto;
import com.goalforge.service.GoalPhaseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/phases")
public class PhaseController {

    private final GoalPhaseService goalPhaseService;

    public PhaseController(GoalPhaseService goalPhaseService) {
        this.goalPhaseService = goalPhaseService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalPhaseDto>> getPhase(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        GoalPhaseDto phase = goalPhaseService.getPhaseById(id, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Phase retrieved successfully", phase));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalPhaseDto>> updatePhase(
            @PathVariable Long id,
            @Valid @RequestBody GoalPhaseDto dto,
            Authentication authentication) {
        String userEmail = authentication.getName();
        GoalPhaseDto updated = goalPhaseService.updatePhaseDirect(id, dto, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Phase updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePhase(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        goalPhaseService.deletePhaseDirect(id, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Phase deleted successfully", null));
    }
}
