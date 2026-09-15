package com.goalforge.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.goalforge.dto.LoginRequest;
import com.goalforge.dto.RegisterRequest;
import com.goalforge.entity.User;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.goalforge.repository.GoalRepository goalRepository;

    @Autowired
    private com.goalforge.repository.GoalPhaseRepository goalPhaseRepository;

    @Autowired
    private com.goalforge.repository.TaskRepository taskRepository;

    @Autowired
    private com.goalforge.repository.DailyProgressRepository dailyProgressRepository;

    @Autowired
    private com.goalforge.repository.AchievementRepository achievementRepository;

    @Autowired
    private com.goalforge.repository.NotificationRepository notificationRepository;

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

    @Test
    @DisplayName("POST /api/auth/register - Successfully registers user and hashes password with BCrypt")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("Alex Morgan", "alex@goalforge.io", "securePassword123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.type").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("alex@goalforge.io"))
                .andExpect(jsonPath("$.data.user.fullName").value("Alex Morgan"));

        // Verify password is encrypted in database and never stored in plain-text
        Optional<User> savedUser = userRepository.findByEmail("alex@goalforge.io");
        assertTrue(savedUser.isPresent());
        assertNotEquals("securePassword123", savedUser.get().getPassword());
        assertTrue(savedUser.get().getPassword().startsWith("$2a$") || savedUser.get().getPassword().startsWith("$2b$"));
    }

    @Test
    @DisplayName("POST /api/auth/register - Rejects duplicate email with 409 Conflict")
    void testRegisterDuplicateEmail() throws Exception {
        RegisterRequest request1 = new RegisterRequest("Alex Morgan", "duplicate@goalforge.io", "password123");
        RegisterRequest request2 = new RegisterRequest("Another User", "duplicate@goalforge.io", "password456");

        // First registration succeeds
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());

        // Second registration with same email must fail
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("already exists")));
    }

    @Test
    @DisplayName("POST /api/auth/register - Rejects invalid input with 400 Bad Request")
    void testRegisterValidationFailure() throws Exception {
        RegisterRequest invalidRequest = new RegisterRequest("", "not-an-email", "123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/auth/login - Successfully authenticates user and returns JWT token")
    void testLoginSuccess() throws Exception {
        // Register first
        RegisterRequest regRequest = new RegisterRequest("Jordan Lee", "jordan@goalforge.io", "mypassword123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated());

        // Perform login
        LoginRequest loginRequest = new LoginRequest("jordan@goalforge.io", "mypassword123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("jordan@goalforge.io"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Rejects invalid credentials with 401 Unauthorized")
    void testLoginInvalidCredentials() throws Exception {
        // Register user
        RegisterRequest regRequest = new RegisterRequest("Jordan Lee", "jordan2@goalforge.io", "mypassword123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated());

        // Attempt login with incorrect password
        LoginRequest wrongPassword = new LoginRequest("jordan2@goalforge.io", "wrongpassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongPassword)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/auth/me - Authenticates with JWT and returns user profile")
    void testGetCurrentUserWithValidJwt() throws Exception {
        // Register and extract token
        RegisterRequest regRequest = new RegisterRequest("Elena Rostova", "elena@goalforge.io", "elenaPass999");
        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String jsonResponse = regResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(jsonResponse).path("data").path("token").asText();
        assertNotNull(token);
        assertFalse(token.isEmpty());

        // Call protected /api/auth/me endpoint using Bearer token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("elena@goalforge.io"))
                .andExpect(jsonPath("$.data.fullName").value("Elena Rostova"));
    }

    @Test
    @DisplayName("GET /api/auth/me - Rejects request without JWT with 401 Unauthorized")
    void testGetCurrentUserWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
