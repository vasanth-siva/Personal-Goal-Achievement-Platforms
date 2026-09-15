package com.goalforge.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goalforge.dto.RegisterRequest;
import com.goalforge.entity.*;
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
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CalendarControllerTest {

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
    @DisplayName("GET /api/calendar/events should return 401 when unauthenticated")
    void testGetCalendarEventsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/calendar/events"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/calendar/events should aggregate goal deadlines, task deadlines, milestones, and completed tasks")
    void testGetCalendarEventsAggregated() throws Exception {
        String token = registerAndGetToken("Calendar User", "calendar@test.com", "Password123!");
        User user = userRepository.findByEmail("calendar@test.com").orElseThrow();

        // 1. Goal with targetDate
        Goal goal = new Goal("Master TypeScript", "Type systems", "Skills", "High", 50, "In Progress",
                LocalDate.now(), LocalDate.now().plusMonths(2), user);
        goal = goalRepository.save(goal);

        // 2. Goal Phase
        GoalPhase phase = new GoalPhase(goal, "Generics & Utility Types", "Deep dive", 1, "In Progress", 50);
        phase = goalPhaseRepository.save(phase);

        // 3. Pending Task with due date -> TASK_DEADLINE
        Task pendingTask = new Task(phase, "Implement Type Guards", "Custom type guards",
                LocalDate.now().plusDays(3), "High", "Pending", false);
        taskRepository.save(pendingTask);

        // 4. Completed Task -> COMPLETED_TASK
        Task completedTask = new Task(phase, "Read Handbook", "Basics",
                LocalDate.now().minusDays(1), "Medium", "Completed", true);
        taskRepository.save(completedTask);

        // 5. Achievement -> MILESTONE
        Achievement achievement = new Achievement(user, "First Goal Created", "Created target", "FIRST_GOAL_CREATED", LocalDateTime.now());
        achievementRepository.save(achievement);

        // Perform GET /api/calendar/events
        mockMvc.perform(get("/api/calendar/events")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(4)))
                .andExpect(jsonPath("$.data[*].type", hasItems("GOAL_DEADLINE", "TASK_DEADLINE", "COMPLETED_TASK", "MILESTONE")));
    }
}
