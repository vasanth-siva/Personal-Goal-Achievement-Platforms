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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private GoalPhaseRepository phaseRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private com.goalforge.repository.DailyProgressRepository dailyProgressRepository;

    @BeforeEach
    void setUp() {
        dailyProgressRepository.deleteAll();
        taskRepository.deleteAll();
        phaseRepository.deleteAll();
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

    private long createGoal(String token, String title) throws Exception {
        GoalDto newGoal = new GoalDto();
        newGoal.setTitle(title);
        newGoal.setCategory("Career");
        newGoal.setPriority("High");

        MvcResult result = mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newGoal)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).path("data").path("id").asLong();
    }

    private long createPhase(String token, long goalId, String phaseName) throws Exception {
        GoalPhaseDto phase = new GoalPhaseDto();
        phase.setPhaseName(phaseName);
        phase.setProgressPercentage(0);
        phase.setStatus("Not Started");

        MvcResult result = mockMvc.perform(post("/api/goals/" + goalId + "/phases")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(phase)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).path("data").path("id").asLong();
    }

    @Test
    @DisplayName("Cascading Progress Engine: Task Completion -> Phase Progress -> Goal Progress")
    void testCascadingProgressEngine() throws Exception {
        String token = registerAndGetToken("Alex Morgan", "alex@cascading.io", "password123");
        long goalId = createGoal(token, "Become a Java Full Stack Developer");
        long phaseId = createPhase(token, goalId, "Java Fundamentals");

        // 1. Create Task 1 (completed = true)
        TaskDto task1 = new TaskDto();
        task1.setTitle("Master Primitive Types & Control Flow");
        task1.setCompleted(true);
        task1.setStatus("Completed");

        mockMvc.perform(post("/api/phases/" + phaseId + "/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(task1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Master Primitive Types & Control Flow"))
                .andExpect(jsonPath("$.data.completed").value(true));

        // Verify Phase progress is now 100% (1/1 completed)
        mockMvc.perform(get("/api/goals/" + goalId + "/phases")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].progressPercentage").value(100))
                .andExpect(jsonPath("$.data[0].status").value("Completed"));

        // Verify Goal progress is now 100%
        mockMvc.perform(get("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.progress").value(100));

        // 2. Create Task 2 (completed = false)
        TaskDto task2 = new TaskDto();
        task2.setTitle("Build OOP Banking Application");
        task2.setCompleted(false);
        task2.setStatus("Pending");

        MvcResult t2Result = mockMvc.perform(post("/api/phases/" + phaseId + "/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(task2)))
                .andExpect(status().isCreated())
                .andReturn();

        long task2Id = objectMapper.readTree(t2Result.getResponse().getContentAsString()).path("data").path("id").asLong();

        // Verify Phase progress automatically dropped to 50% (1 of 2 completed)
        mockMvc.perform(get("/api/goals/" + goalId + "/phases")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].progressPercentage").value(50))
                .andExpect(jsonPath("$.data[0].status").value("In Progress"));

        // Verify Goal progress automatically dropped to 50%
        mockMvc.perform(get("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.progress").value(50));

        // 3. Mark Task 2 Complete via PUT /api/tasks/{id}
        TaskDto updateDto = new TaskDto();
        updateDto.setCompleted(true);
        updateDto.setStatus("Completed");

        mockMvc.perform(put("/api/tasks/" + task2Id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completed").value(true));

        // Verify Phase progress returned to 100% (2 of 2 completed)
        mockMvc.perform(get("/api/goals/" + goalId + "/phases")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].progressPercentage").value(100));

        // Verify Goal progress returned to 100%
        mockMvc.perform(get("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.progress").value(100));
    }

    @Test
    @DisplayName("Task User Isolation: Other user cannot access or mutate tasks")
    void testTaskUserIsolation() throws Exception {
        String token1 = registerAndGetToken("User 1", "u1@taskisolation.io", "password123");
        String token2 = registerAndGetToken("User 2", "u2@taskisolation.io", "password123");

        long goal1 = createGoal(token1, "User 1 Goal");
        long phase1 = createPhase(token1, goal1, "User 1 Phase");

        TaskDto task = new TaskDto();
        task.setTitle("User 1 Secret Task");

        MvcResult res = mockMvc.perform(post("/api/phases/" + phase1 + "/tasks")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(task)))
                .andExpect(status().isCreated())
                .andReturn();

        long taskId = objectMapper.readTree(res.getResponse().getContentAsString()).path("data").path("id").asLong();

        // User 2 cannot view phase tasks - blocked with 403 Forbidden
        mockMvc.perform(get("/api/phases/" + phase1 + "/tasks")
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isForbidden());

        // User 2 cannot update User 1's task - blocked with 403 Forbidden
        TaskDto maliciousUpdate = new TaskDto();
        maliciousUpdate.setTitle("Hacked Title");

        mockMvc.perform(put("/api/tasks/" + taskId)
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(maliciousUpdate)))
                .andExpect(status().isForbidden());

        // User 2 cannot delete User 1's task - blocked with 403 Forbidden
        mockMvc.perform(delete("/api/tasks/" + taskId)
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isForbidden());
    }
}
