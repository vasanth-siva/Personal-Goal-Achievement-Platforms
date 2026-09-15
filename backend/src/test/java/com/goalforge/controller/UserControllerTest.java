package com.goalforge.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goalforge.dto.ChangePasswordRequest;
import com.goalforge.dto.RegisterRequest;
import com.goalforge.dto.UpdatePreferencesRequest;
import com.goalforge.dto.UpdateProfileRequest;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {

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

    @Autowired
    private NotificationRepository notificationRepository;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
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
    @DisplayName("GET /api/users/profile should return 401 when unauthenticated")
    void testGetProfileUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/users/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("User profile flow: get profile, update profile, change password, update preferences")
    void testUserProfileAndSettingsFlow() throws Exception {
        String token = registerAndGetToken("Jordan Reed", "jordan@test.com", "OldPassword123!");

        // 1. Get profile
        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName", is("Jordan Reed")))
                .andExpect(jsonPath("$.data.email", is("jordan@test.com")))
                .andExpect(jsonPath("$.data.avatar", notNullValue()))
                .andExpect(jsonPath("$.data.totalGoals", is(0)))
                .andExpect(jsonPath("$.data.completedGoals", is(0)))
                .andExpect(jsonPath("$.data.currentStreak", is(0)));

        // 2. Update profile
        UpdateProfileRequest updateReq = new UpdateProfileRequest("Jordan Alex Reed", "🎯");
        mockMvc.perform(put("/api/users/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName", is("Jordan Alex Reed")))
                .andExpect(jsonPath("$.data.avatar", is("🎯")));

        // 3. Change password with wrong current password -> error
        ChangePasswordRequest wrongPass = new ChangePasswordRequest("WrongPass!", "NewPass123!", "NewPass123!");
        mockMvc.perform(put("/api/users/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongPass)))
                .andExpect(status().isBadRequest());

        // 4. Change password successfully
        ChangePasswordRequest validPass = new ChangePasswordRequest("OldPassword123!", "NewPass123!", "NewPass123!");
        mockMvc.perform(put("/api/users/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validPass)))
                .andExpect(status().isOk());

        // 5. Update preferences
        UpdatePreferencesRequest prefReq = new UpdatePreferencesRequest("dark", true, true, false, true);
        mockMvc.perform(put("/api/users/preferences")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prefReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.themePreference", is("dark")))
                .andExpect(jsonPath("$.data.notifyStreak", is(false)))
                .andExpect(jsonPath("$.data.notifyWeeklyDigest", is(true)));
    }
}
