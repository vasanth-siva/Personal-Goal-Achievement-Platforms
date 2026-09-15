package com.goalforge.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goalforge.dto.GoalDto;
import com.goalforge.dto.RegisterRequest;
import com.goalforge.repository.*;
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
public class AchievementControllerTest {

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

    @Autowired
    private AchievementRepository achievementRepository;

    @BeforeEach
    void setUp() {
        achievementRepository.deleteAll();
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

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("data").get("token").asText();
    }

    @Test
    @DisplayName("GET /api/achievements should return 401 when unauthenticated")
    void testGetAchievementsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/achievements"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/achievements should return all 7 achievements as locked for fresh user")
    void testGetAchievementsFreshUser() throws Exception {
        String token = registerAndGetToken("Achievement User", "achieve@test.com", "Password123!");

        mockMvc.perform(get("/api/achievements")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalAchievements", is(7)))
                .andExpect(jsonPath("$.data.unlockedCount", is(0)))
                .andExpect(jsonPath("$.data.lockedCount", is(7)))
                .andExpect(jsonPath("$.data.locked", hasSize(7)))
                .andExpect(jsonPath("$.data.unlocked", hasSize(0)));
    }

    @Test
    @DisplayName("Automatically unlock First Goal Created when user creates their first goal")
    void testAutoUnlockFirstGoalCreated() throws Exception {
        String token = registerAndGetToken("Goal Creator", "creator@test.com", "Password123!");

        // Create a goal
        GoalDto goalDto = new GoalDto();
        goalDto.setTitle("Learn Rust");
        goalDto.setDescription("Master systems programming");
        goalDto.setCategory("Career");
        goalDto.setTargetDate(LocalDate.now().plusMonths(3));

        mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(goalDto)))
                .andExpect(status().isCreated());

        // Check achievements endpoint
        mockMvc.perform(get("/api/achievements")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.unlockedCount", is(1)))
                .andExpect(jsonPath("$.data.lockedCount", is(6)))
                .andExpect(jsonPath("$.data.unlocked[0].achievementType", is("FIRST_GOAL_CREATED")))
                .andExpect(jsonPath("$.data.unlocked[0].title", is("First Goal Created")))
                .andExpect(jsonPath("$.data.unlocked[0].icon", is("🎯")))
                .andExpect(jsonPath("$.data.unlocked[0].unlocked", is(true)))
                .andExpect(jsonPath("$.data.newlyUnlocked", hasSize(1)))
                .andExpect(jsonPath("$.data.newlyUnlocked[0].achievementType", is("FIRST_GOAL_CREATED")))
                .andReturn();

        // Second call should still show it unlocked, but not newly unlocked
        mockMvc.perform(get("/api/achievements")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unlockedCount", is(1)))
                .andExpect(jsonPath("$.data.newlyUnlocked", hasSize(0)));
    }
}
