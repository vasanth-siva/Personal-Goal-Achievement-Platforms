package com.goalforge.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goalforge.dto.RegisterRequest;
import com.goalforge.entity.Notification;
import com.goalforge.entity.User;
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

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class NotificationControllerTest {

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
    @DisplayName("GET /api/notifications should return 401 when unauthenticated")
    void testGetNotificationsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Notification CRUD: read/unread, mark as read, delete, clear all")
    void testNotificationCrudFlow() throws Exception {
        String token = registerAndGetToken("Notification User", "notif@test.com", "Password123!");
        User user = userRepository.findByEmail("notif@test.com").orElseThrow();

        // Seed 2 notifications
        Notification n1 = notificationRepository.save(new Notification(user, "Your Java task is due tomorrow.", "TASK_DUE", false, LocalDateTime.now()));
        Notification n2 = notificationRepository.save(new Notification(user, "You're on a 7-day streak 🔥", "STREAK", false, LocalDateTime.now().minusMinutes(5)));

        // Verify unread count is 2
        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unreadCount", is(2)));

        // Get notifications list
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].message", is("Your Java task is due tomorrow.")))
                .andExpect(jsonPath("$.data[0].isRead", is(false)));

        // Mark n1 as read
        mockMvc.perform(patch("/api/notifications/" + n1.getId() + "/read")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isRead", is(true)));

        // Verify unread count decreased to 1
        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unreadCount", is(1)));

        // Delete n2
        mockMvc.perform(delete("/api/notifications/" + n2.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Verify only 1 notification remains
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));

        // Clear all notifications
        mockMvc.perform(delete("/api/notifications")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Verify empty list
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }
}
