package com.goalforge.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goalforge.dto.GoalDto;
import com.goalforge.dto.GoalPhaseDto;
import com.goalforge.dto.RegisterRequest;
import com.goalforge.dto.TaskDto;
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
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class GoalControllerTest {

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
    private com.goalforge.repository.DailyProgressRepository dailyProgressRepository;

    @BeforeEach
    void setUp() {
        dailyProgressRepository.deleteAll();
        taskRepository.deleteAll();
        goalPhaseRepository.deleteAll();
        goalRepository.deleteAll();
        userRepository.deleteAll();
    }

    private String registerAndGetToken(String name, String email, String password) throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(name, email, password);
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.path("data").path("token").asText();
    }

    @Test
    @DisplayName("GET /api/goals - Enforces user data isolation (only returns logged-in user's goals)")
    void testGetAllGoalsUserIsolation() throws Exception {
        String tokenUser1 = registerAndGetToken("User One", "user1@goalforge.io", "password123");
        String tokenUser2 = registerAndGetToken("User Two", "user2@goalforge.io", "password123");

        // User 1 creates a goal
        GoalDto goal1 = new GoalDto();
        goal1.setTitle("User 1 Secret Target");
        goal1.setCategory("Career");
        goal1.setPriority("High");
        goal1.setProgress(30);
        goal1.setStatus("In Progress");

        mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(goal1)))
                .andExpect(status().isCreated());

        // User 2 creates a goal
        GoalDto goal2 = new GoalDto();
        goal2.setTitle("User 2 Personal Mission");
        goal2.setCategory("Fitness");
        goal2.setPriority("Medium");
        goal2.setProgress(10);
        goal2.setStatus("Not Started");

        mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + tokenUser2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(goal2)))
                .andExpect(status().isCreated());

        // When User 1 requests /api/goals, they only receive User 1's goal
        mockMvc.perform(get("/api/goals")
                        .header("Authorization", "Bearer " + tokenUser1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title").value("User 1 Secret Target"))
                .andExpect(jsonPath("$.data[0].category").value("Career"));

        // When User 2 requests /api/goals, they only receive User 2's goal
        mockMvc.perform(get("/api/goals")
                        .header("Authorization", "Bearer " + tokenUser2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title").value("User 2 Personal Mission"))
                .andExpect(jsonPath("$.data[0].category").value("Fitness"));
    }

    @Test
    @DisplayName("POST /api/goals - Successfully creates goal with all specified fields")
    void testCreateGoalSuccess() throws Exception {
        String token = registerAndGetToken("Alex Morgan", "alex@goalforge.io", "password123");

        GoalDto newGoal = new GoalDto();
        newGoal.setTitle("Launch Production Microservices");
        newGoal.setDescription("Deploy scalable Java Spring Boot services to AWS/Supabase.");
        newGoal.setCategory("Career");
        newGoal.setPriority("High");
        newGoal.setProgress(0);
        newGoal.setStatus("Not Started");
        newGoal.setStartDate(LocalDate.now());
        newGoal.setTargetDate(LocalDate.now().plusMonths(2));

        mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newGoal)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.title").value("Launch Production Microservices"))
                .andExpect(jsonPath("$.data.category").value("Career"))
                .andExpect(jsonPath("$.data.priority").value("High"))
                .andExpect(jsonPath("$.data.status").value("Not Started"))
                .andExpect(jsonPath("$.data.startDate").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.data.targetDate").value(LocalDate.now().plusMonths(2).toString()));
    }

    @Test
    @DisplayName("GET /api/goals/{id} - Successfully retrieves owned goal by ID")
    void testGetGoalByIdSuccess() throws Exception {
        String token = registerAndGetToken("Alex Morgan", "alex@goalforge.io", "password123");

        GoalDto newGoal = new GoalDto();
        newGoal.setTitle("Master Algorithm Problems");
        newGoal.setCategory("Skills");
        newGoal.setPriority("Medium");

        MvcResult createResult = mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newGoal)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode createdNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long goalId = createdNode.path("data").path("id").asLong();

        mockMvc.perform(get("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(goalId))
                .andExpect(jsonPath("$.data.title").value("Master Algorithm Problems"));
    }

    @Test
    @DisplayName("GET /api/goals/{id} - Returns 404 when querying another user's goal")
    void testGetOtherUserGoalReturnsNotFound() throws Exception {
        String tokenUser1 = registerAndGetToken("User One", "user1@goalforge.io", "password123");
        String tokenUser2 = registerAndGetToken("User Two", "user2@goalforge.io", "password123");

        GoalDto goal1 = new GoalDto();
        goal1.setTitle("User 1 Confidential Target");
        goal1.setCategory("Finance");

        MvcResult createResult = mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(goal1)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode createdNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long goalId = createdNode.path("data").path("id").asLong();

        // User 2 attempts to fetch User 1's goal - must be blocked with 403 Forbidden
        mockMvc.perform(get("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + tokenUser2))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/goals/{id} - Successfully updates goal progress and status")
    void testUpdateGoalSuccess() throws Exception {
        String token = registerAndGetToken("Alex Morgan", "alex@goalforge.io", "password123");

        GoalDto newGoal = new GoalDto();
        newGoal.setTitle("Marathon Preparation");
        newGoal.setCategory("Fitness");
        newGoal.setProgress(10);
        newGoal.setStatus("In Progress");

        MvcResult createResult = mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newGoal)))
                .andExpect(status().isCreated())
                .andReturn();

        long goalId = objectMapper.readTree(createResult.getResponse().getContentAsString()).path("data").path("id").asLong();

        GoalDto updateDto = new GoalDto();
        updateDto.setProgress(75);
        updateDto.setStatus("In Progress");
        updateDto.setPriority("High");

        mockMvc.perform(put("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.progress").value(75))
                .andExpect(jsonPath("$.data.priority").value("High"));
    }

    @Test
    @DisplayName("DELETE /api/goals/{id} - Successfully deletes goal")
    void testDeleteGoalSuccess() throws Exception {
        String token = registerAndGetToken("Alex Morgan", "alex@goalforge.io", "password123");

        GoalDto newGoal = new GoalDto();
        newGoal.setTitle("Temporary Goal");
        newGoal.setCategory("Other");

        MvcResult createResult = mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newGoal)))
                .andExpect(status().isCreated())
                .andReturn();

        long goalId = objectMapper.readTree(createResult.getResponse().getContentAsString()).path("data").path("id").asLong();

        mockMvc.perform(delete("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Confirm it is gone
        mockMvc.perform(get("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/goals/{id} - Cascading delete safely cleans up phases and tasks")
    void testDeleteGoalWithPhasesAndTasksCascadesCleanly() throws Exception {
        String token = registerAndGetToken("Cascade Tester", "cascade@goalforge.io", "password123");

        // 1. Create Goal
        GoalDto newGoal = new GoalDto();
        newGoal.setTitle("Goal With Nested Hierarchy");
        newGoal.setCategory("Career");

        MvcResult goalResult = mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newGoal)))
                .andExpect(status().isCreated())
                .andReturn();

        long goalId = objectMapper.readTree(goalResult.getResponse().getContentAsString()).path("data").path("id").asLong();

        // 2. Create Phase
        GoalPhaseDto phase = new GoalPhaseDto();
        phase.setPhaseName("Architecture Phase");
        phase.setPhaseOrder(1);

        MvcResult phaseResult = mockMvc.perform(post("/api/goals/" + goalId + "/phases")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(phase)))
                .andExpect(status().isCreated())
                .andReturn();

        long phaseId = objectMapper.readTree(phaseResult.getResponse().getContentAsString()).path("data").path("id").asLong();

        // 3. Create Task
        TaskDto task = new TaskDto();
        task.setTitle("Setup PostgreSQL schemas");
        task.setPriority("High");

        mockMvc.perform(post("/api/phases/" + phaseId + "/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(task)))
                .andExpect(status().isCreated());

        assertEquals(1, goalPhaseRepository.count());
        assertEquals(1, taskRepository.count());

        // 4. Delete Goal -> Must cascade delete phase & task without foreign key errors
        mockMvc.perform(delete("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 5. Verify all levels are deleted
        mockMvc.perform(get("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());

        assertEquals(0, goalPhaseRepository.count());
        assertEquals(0, taskRepository.count());
    }

    @Test
    @DisplayName("GET /api/goals - Returns 401 Unauthorized when missing Bearer token")
    void testUnauthenticatedAccessFails() throws Exception {
        mockMvc.perform(get("/api/goals"))
                .andExpect(status().isUnauthorized());
    }
}
