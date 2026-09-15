package com.goalforge.controller;

import com.goalforge.dto.AchievementDto;
import com.goalforge.dto.AchievementSummaryDto;
import com.goalforge.dto.ApiResponse;
import com.goalforge.service.AchievementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AchievementSummaryDto>> getAchievements(Authentication authentication) {
        String userEmail = authentication.getName();
        AchievementSummaryDto summary = achievementService.checkAndGetAchievements(userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Achievements retrieved successfully", summary));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AchievementDto>> getAchievement(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        AchievementDto dto = achievementService.getAchievementById(id, userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Achievement retrieved successfully", dto));
    }

    @PostMapping("/check")
    public ResponseEntity<ApiResponse<AchievementSummaryDto>> checkAchievements(Authentication authentication) {
        String userEmail = authentication.getName();
        AchievementSummaryDto summary = achievementService.checkAndGetAchievements(userEmail);
        return ResponseEntity.ok(ApiResponse.ok("Achievements evaluated successfully", summary));
    }
}
