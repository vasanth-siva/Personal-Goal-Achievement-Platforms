package com.goalforge.controller;

import com.goalforge.dto.ApiResponse;
import com.goalforge.dto.DailyProgressDto;
import com.goalforge.dto.ProgressStatisticsDto;
import com.goalforge.service.DailyProgressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final DailyProgressService dailyProgressService;

    public ProgressController(DailyProgressService dailyProgressService) {
        this.dailyProgressService = dailyProgressService;
    }

    @GetMapping({"/stats", "/statistics"})
    public ResponseEntity<ApiResponse<ProgressStatisticsDto>> getProgressStatistics(Authentication authentication) {
        String userEmail = authentication.getName();
        ProgressStatisticsDto stats = dailyProgressService.calculateProgressStatistics(userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Progress statistics calculated successfully", stats));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<DailyProgressDto>>> getProgressLogs(Authentication authentication) {
        String userEmail = authentication.getName();
        List<DailyProgressDto> logs = dailyProgressService.getLogsByUser(userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Daily progress logs retrieved successfully", logs));
    }

    @GetMapping("/logs/{id}")
    public ResponseEntity<ApiResponse<DailyProgressDto>> getProgressLog(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        DailyProgressDto log = dailyProgressService.getLogById(id, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Daily progress log retrieved successfully", log));
    }

    @PostMapping("/logs")
    public ResponseEntity<ApiResponse<DailyProgressDto>> createProgressLog(
            @Valid @RequestBody DailyProgressDto dto,
            Authentication authentication) {
        String userEmail = authentication.getName();
        DailyProgressDto created = dailyProgressService.createLog(dto, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Daily progress log created successfully", created));
    }

    @PutMapping("/logs/{id}")
    public ResponseEntity<ApiResponse<DailyProgressDto>> updateProgressLog(
            @PathVariable Long id,
            @Valid @RequestBody DailyProgressDto dto,
            Authentication authentication) {
        String userEmail = authentication.getName();
        DailyProgressDto updated = dailyProgressService.updateLog(id, dto, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Daily progress log updated successfully", updated));
    }

    @DeleteMapping("/logs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProgressLog(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        dailyProgressService.deleteLog(id, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Daily progress log deleted successfully", null));
    }
}
