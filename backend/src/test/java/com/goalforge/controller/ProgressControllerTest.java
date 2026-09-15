package com.goalforge.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goalforge.dto.DailyProgressDto;
import com.goalforge.dto.GoalDto;
import com.goalforge.dto.RegisterRequest;
import com.goalforge.repository.DailyProgressRepository;
import com.goalforge.repository.GoalPhaseRepository;
import com.goalforge.repository.GoalRepository;
import com.goalforge.repository.TaskRepository;
import com.goalforge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private GoalPhaseRepository goalPhaseRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private DailyProgressRepository dailyProgressRepository;

    @BeforeEach
    void setUp() {
        dailyProgressRepository.deleteAll();
        taskRepository.deleteAll();
        goalPhaseRepository.deleteAll();
        goalRepository.deleteAll();
        userRepository.deleteAll();
    }

    private String registerAndGetToken(String name, String email, String password) throws Exception {
        RegisterRequest registerReq = new RegisterRequest(name, email, password);
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.path("data").path("token").asText();
    }

    @Test
    @DisplayName("Create daily progress log and retrieve statistics")
    void testCreateProgressLogAndGetStats() throws Exception {
        String token = registerAndGetToken("Tracker User", "tracker@example.com", "Password123!");

        // 1. Create a Goal first
        GoalDto goalDto = new GoalDto();
        goalDto.setTitle("Learn Microservices");
        goalDto.setCategory("Career");
        goalDto.setPriority("High");
        goalDto.setProgress(50);
        goalDto.setStatus("In Progress");

        MvcResult goalResult = mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(goalDto)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode goalNode = objectMapper.readTree(goalResult.getResponse().getContentAsString());
        Long goalId = goalNode.path("data").path("id").asLong();

        // 2. Create Daily Progress Log
        DailyProgressDto logDto = new DailyProgressDto();
        logDto.setGoalId(goalId);
        logDto.setProgressDate(LocalDate.now());
        logDto.setProgressPercentage(75);
        logDto.setNotes("Completed service discovery with Eureka and Zuul gateway setup.");

        mockMvc.perform(post("/api/progress/logs")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.progressPercentage", is(75)))
                .andExpect(jsonPath("$.data.goalTitle", is("Learn Microservices")));

        // 3. Fetch Statistics
        mockMvc.perform(get("/api/progress/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.overallGoalProgress", is(50.0)))
                .andExpect(jsonPath("$.data.dailyProgress", is(75.0)))
                .andExpect(jsonPath("$.data.currentStreak", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.weeklyTrend", hasSize(7)))
                .andExpect(jsonPath("$.data.monthlyActivity", hasSize(30)))
                .andExpect(jsonPath("$.data.recentLogs", hasSize(1)));
    }
}
