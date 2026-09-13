package com.goalforge.controller;

import com.goalforge.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final DataSource dataSource;

    @Value("${spring.application.name:goalforge-backend}")
    private String appName;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        Map<String, Object> details = new HashMap<>();
        details.put("application", appName);
        details.put("status", "UP");
        details.put("version", "1.0.0");
        details.put("serverTime", LocalDateTime.now().toString());

        try (Connection conn = dataSource.getConnection()) {
            details.put("database", "CONNECTED");
            details.put("databaseProductName", conn.getMetaData().getDatabaseProductName());
        } catch (Exception e) {
            details.put("database", "ERROR: " + e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.ok("GoalForge backend is operating normally", details));
    }
}
