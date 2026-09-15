package com.goalforge.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goalforge.dto.GoalDto;
import com.goalforge.dto.GoalPhaseDto;
import com.goalforge.dto.RegisterRequest;
import com.goalforge.dto.ReorderPhasesRequest;
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

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class GoalPhaseControllerTest {

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

    @Test
    @DisplayName("Add phase and verify automated goal progress calculation")
    void testAddPhaseAndAutoRecalculateProgress() throws Exception {
        String token = registerAndGetToken("Alex Developer", "alex@developer.io", "password123");
        long goalId = createGoal(token, "Become a Java Full Stack Developer");

        // Add Phase 1 (100% complete)
        GoalPhaseDto phase1 = new GoalPhaseDto();
        phase1.setPhaseName("Java Fundamentals");
        phase1.setDescription("Syntax, OOP, Collections");
        phase1.setProgressPercentage(100);
        phase1.setStatus("Completed");

        mockMvc.perform(post("/api/goals/" + goalId + "/phases")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(phase1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.phaseName").value("Java Fundamentals"))
                .andExpect(jsonPath("$.data.phaseOrder").value(1));

        // Parent Goal progress should now automatically be 100%
        mockMvc.perform(get("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.progress").value(100))
                .andExpect(jsonPath("$.data.status").value("Completed"));

        // Add Phase 2 (0% progress)
        GoalPhaseDto phase2 = new GoalPhaseDto();
        phase2.setPhaseName("Advanced Java");
        phase2.setProgressPercentage(0);
        phase2.setStatus("Not Started");

        mockMvc.perform(post("/api/goals/" + goalId + "/phases")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(phase2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.phaseName").value("Advanced Java"))
                .andExpect(jsonPath("$.data.phaseOrder").value(2));

        // Parent Goal progress should now automatically be 50% (avg of 100 and 0) and status "In Progress"
        mockMvc.perform(get("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.progress").value(50))
                .andExpect(jsonPath("$.data.status").value("In Progress"));
    }

    @Test
    @DisplayName("Toggle phase complete and verify goal progress updates")
    void testTogglePhaseComplete() throws Exception {
        String token = registerAndGetToken("Alex Developer", "alex@developer.io", "password123");
        long goalId = createGoal(token, "Become a Java Full Stack Developer");

        GoalPhaseDto phase1 = new GoalPhaseDto();
        phase1.setPhaseName("Spring Boot");
        phase1.setProgressPercentage(0);
        phase1.setStatus("Not Started");

        MvcResult res = mockMvc.perform(post("/api/goals/" + goalId + "/phases")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(phase1)))
                .andExpect(status().isCreated())
                .andReturn();

        long phaseId = objectMapper.readTree(res.getResponse().getContentAsString()).path("data").path("id").asLong();

        // Toggle complete
        mockMvc.perform(patch("/api/goals/" + goalId + "/phases/" + phaseId + "/complete")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("Completed"))
                .andExpect(jsonPath("$.data.progressPercentage").value(100));

        // Verify goal updated
        mockMvc.perform(get("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.progress").value(100))
                .andExpect(jsonPath("$.data.status").value("Completed"));
    }

    @Test
    @DisplayName("Reorder phases and verify sequential ordering")
    void testReorderPhases() throws Exception {
        String token = registerAndGetToken("Alex Developer", "alex@developer.io", "password123");
        long goalId = createGoal(token, "Become a Java Full Stack Developer");

        GoalPhaseDto p1 = new GoalPhaseDto();
        p1.setPhaseName("Phase A");
        MvcResult r1 = mockMvc.perform(post("/api/goals/" + goalId + "/phases")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(p1)))
                .andReturn();
        long id1 = objectMapper.readTree(r1.getResponse().getContentAsString()).path("data").path("id").asLong();

        GoalPhaseDto p2 = new GoalPhaseDto();
        p2.setPhaseName("Phase B");
        MvcResult r2 = mockMvc.perform(post("/api/goals/" + goalId + "/phases")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(p2)))
                .andReturn();
        long id2 = objectMapper.readTree(r2.getResponse().getContentAsString()).path("data").path("id").asLong();

        // Reorder: Phase B first, then Phase A
        ReorderPhasesRequest reorderReq = new ReorderPhasesRequest(Arrays.asList(id2, id1));

        mockMvc.perform(put("/api/goals/" + goalId + "/phases/reorder")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reorderReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(id2))
                .andExpect(jsonPath("$.data[0].phaseOrder").value(1))
                .andExpect(jsonPath("$.data[1].id").value(id1))
                .andExpect(jsonPath("$.data[1].phaseOrder").value(2));
    }

    @Test
    @DisplayName("Phase security isolation: other user cannot view or add phases")
    void testPhaseSecurityIsolation() throws Exception {
        String token1 = registerAndGetToken("User 1", "u1@goalforge.io", "password123");
        String token2 = registerAndGetToken("User 2", "u2@goalforge.io", "password123");

        long goal1 = createGoal(token1, "User 1 Private Goal");

        // User 2 tries to fetch phases of User 1's goal - blocked with 403 Forbidden
        mockMvc.perform(get("/api/goals/" + goal1 + "/phases")
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isForbidden());

        // User 2 tries to add phase to User 1's goal - blocked with 403 Forbidden
        GoalPhaseDto phase = new GoalPhaseDto();
        phase.setPhaseName("Intruder Phase");

        mockMvc.perform(post("/api/goals/" + goal1 + "/phases")
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(phase)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/goals/{goalId}/phases/{phaseId} - Cascading delete safely removes tasks and recalculates progress")
    void testDeletePhaseWithTasksCascadesCleanly() throws Exception {
        String token = registerAndGetToken("Phase Tester", "phasetester@goalforge.io", "password123");
        long goalId = createGoal(token, "Cascading Phase Test Goal");

        // 1. Create Phase 1
        GoalPhaseDto phase1 = new GoalPhaseDto();
        phase1.setPhaseName("Phase To Delete");
        phase1.setPhaseOrder(1);

        MvcResult p1Res = mockMvc.perform(post("/api/goals/" + goalId + "/phases")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(phase1)))
                .andExpect(status().isCreated())
                .andReturn();

        long phase1Id = objectMapper.readTree(p1Res.getResponse().getContentAsString()).path("data").path("id").asLong();

        // 2. Add tasks to Phase 1
        TaskDto task = new TaskDto();
        task.setTitle("Phase 1 Child Task");
        task.setCompleted(true);
        task.setStatus("Completed");

        mockMvc.perform(post("/api/phases/" + phase1Id + "/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(task)))
                .andExpect(status().isCreated());

        assertEquals(1, taskRepository.count());
        assertEquals(1, phaseRepository.count());

        // 3. Delete Phase 1 -> Must cascade delete its tasks
        mockMvc.perform(delete("/api/goals/" + goalId + "/phases/" + phase1Id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertEquals(0, taskRepository.count());
        assertEquals(0, phaseRepository.count());

        // 4. Verify Goal progress reset to 0
        mockMvc.perform(get("/api/goals/" + goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.progress").value(0))
                .andExpect(jsonPath("$.data.status").value("Not Started"));
    }
}
