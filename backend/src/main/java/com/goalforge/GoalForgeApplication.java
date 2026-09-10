package com.goalforge;

import com.goalforge.entity.DailyProgress;
import com.goalforge.entity.Goal;
import com.goalforge.entity.GoalPhase;
import com.goalforge.entity.Notification;
import com.goalforge.entity.Task;
import com.goalforge.entity.User;
import com.goalforge.repository.DailyProgressRepository;
import com.goalforge.repository.GoalPhaseRepository;
import com.goalforge.repository.GoalRepository;
import com.goalforge.repository.NotificationRepository;
import com.goalforge.repository.TaskRepository;
import com.goalforge.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootApplication
public class GoalForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(GoalForgeApplication.class, args);
    }

    @Bean
    @ConditionalOnProperty(name = "goalforge.demo-data.enabled", havingValue = "true")
    public CommandLineRunner initDemoData(
            GoalRepository goalRepository,
            GoalPhaseRepository phaseRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            DailyProgressRepository dailyProgressRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed a demo user if none exists
            User demoUser = userRepository.findByEmail("alex.morgan@goalforge.io").orElseGet(() -> {
                User user = new User("Alex Morgan", "alex.morgan@goalforge.io", passwordEncoder.encode("Password123!"));
                return userRepository.save(user);
            });
            userRepository.findByEmail("alex.morgan@example.com").orElseGet(() -> {
                User user = new User("Alex Morgan", "alex.morgan@example.com", passwordEncoder.encode("password123"));
                return userRepository.save(user);
            });

            if (goalRepository.count() == 0) {
                // Goal 1: "Become a Java Full Stack Developer"
                Goal javaGoal = new Goal(
                        "Become a Java Full Stack Developer",
                        "End-to-end curriculum mastering modern backend with Spring Boot 3, modern frontend with React & Vite, distributed architecture, and career portfolio.",
                        "Career",
                        "High",
                        45,
                        "In Progress",
                        LocalDate.now().minusMonths(1),
                        LocalDate.now().plusMonths(5),
                        demoUser
                );
                javaGoal = goalRepository.save(javaGoal);

                // Phase 1: Java Fundamentals (100% complete)
                GoalPhase phase1 = phaseRepository.save(new GoalPhase(javaGoal, "Java Fundamentals", "Syntax, OOP, Collections framework, Exception handling, and Streams API.", 1, "Completed", 100));
                taskRepository.save(new Task(phase1, "Master Primitive Types, Operators & Control Flow", "Variables, loops, conditionals, methods.", LocalDate.now().minusWeeks(3), "Medium", "Completed", true));
                taskRepository.save(new Task(phase1, "OOP Principles: Inheritance, Polymorphism & Interfaces", "Deep dive into OOP core tenets.", LocalDate.now().minusWeeks(2), "High", "Completed", true));
                taskRepository.save(new Task(phase1, "Collections Framework & Streams API", "List, Set, Map, and functional streams.", LocalDate.now().minusWeeks(1), "High", "Completed", true));

                // Phase 2: Advanced Java (100% complete)
                GoalPhase phase2 = phaseRepository.save(new GoalPhase(javaGoal, "Advanced Java", "Multithreading, Concurrency, JVM internals, Memory Model, and Design Patterns.", 2, "Completed", 100));
                taskRepository.save(new Task(phase2, "Concurrency & Multithreading: ExecutorService & Locks", "Thread pools, futures, atomic variables.", LocalDate.now().minusDays(5), "High", "Completed", true));
                taskRepository.save(new Task(phase2, "JVM Internals & Garbage Collection Tuning", "Memory heap, stack, metaspace, GC algorithms.", LocalDate.now().minusDays(2), "Medium", "Completed", true));

                // Phase 3: Spring Boot (In Progress)
                GoalPhase phase3 = phaseRepository.save(new GoalPhase(javaGoal, "Spring Boot", "Spring MVC, Spring Data JPA, Spring Security, JWT authentication, and REST APIs.", 3, "In Progress", 67));
                taskRepository.save(new Task(phase3, "Spring Boot 3 Project Setup & REST Controllers", "Project initialization and architecture.", LocalDate.now().minusDays(1), "High", "Completed", true));
                taskRepository.save(new Task(phase3, "Spring Security 6 & JWT Token Authentication", "Stateless auth, BCrypt, SecurityConfig.", LocalDate.now(), "High", "Completed", true));
                taskRepository.save(new Task(phase3, "Java", "Complete Java microservices and REST controller optimizations.", LocalDate.now().plusDays(1), "High", "Pending", false));
                taskRepository.save(new Task(phase3, "Task Management Cascading Service Layer", "Automatic cascading progress calculation.", LocalDate.now().plusDays(3), "High", "Pending", false));

                // Phase 4: React (Not Started)
                GoalPhase phase4 = phaseRepository.save(new GoalPhase(javaGoal, "React", "Components, Hooks, State management, React Router, and Axios integrations.", 4, "Not Started", 0));
                taskRepository.save(new Task(phase4, "Vite React Setup with Vanilla CSS Design System", "Tokens, buttons, cards, responsive layouts.", LocalDate.now().plusWeeks(1), "Medium", "Pending", false));
                taskRepository.save(new Task(phase4, "Interactive Phase Timeline & Task Checklists", "Step-by-step roadmap components.", LocalDate.now().plusWeeks(2), "High", "Pending", false));

                // Phase 5: Full Stack Project
                phaseRepository.save(new GoalPhase(javaGoal, "Full Stack Project", "Build GoalForge personal achievement platform with PostgreSQL/Supabase.", 5, "Not Started", 0));

                // Phase 6: Job Preparation
                phaseRepository.save(new GoalPhase(javaGoal, "Job Preparation", "Data structures & algorithms, System design interview prep, and resume portfolio.", 6, "Not Started", 0));

                // Goal 2: Fitness
                Goal fitnessGoal = new Goal(
                        "Run 10km Endurance Race",
                        "Maintain a consistent 4-day weekly running schedule and increase stamina.",
                        "Fitness",
                        "Medium",
                        40,
                        "In Progress",
                        LocalDate.now().minusWeeks(1),
                        LocalDate.now().plusMonths(1),
                        demoUser
                );
                fitnessGoal = goalRepository.save(fitnessGoal);
                GoalPhase fitPhase1 = phaseRepository.save(new GoalPhase(fitnessGoal, "Aerobic Base Building", "Establish 5km baseline running 3x per week.", 1, "Completed", 100));
                taskRepository.save(new Task(fitPhase1, "5km Monday Morning Tempo Run", "Pace 5:20/km", LocalDate.now().minusDays(2), "Medium", "Completed", true));
                taskRepository.save(new Task(fitPhase1, "7km Weekend Long Run", "Pace 5:45/km", LocalDate.now().minusDays(1), "High", "Completed", true));

                phaseRepository.save(new GoalPhase(fitnessGoal, "Tempo & Intervals", "Add interval sprint sessions and 7km weekend runs.", 2, "In Progress", 20));
                phaseRepository.save(new GoalPhase(fitnessGoal, "Race Day Simulation", "Complete mock 10km run under target pace.", 3, "Not Started", 0));

                // Goal 3: Finance
                Goal financeGoal = new Goal(
                        "Build Financial Freedom Plan",
                        "Automate savings, establish emergency fund, and build diversified investment portfolio.",
                        "Finance",
                        "High",
                        100,
                        "Completed",
                        LocalDate.now().minusMonths(3),
                        LocalDate.now().minusWeeks(1),
                        demoUser
                );
                goalRepository.save(financeGoal);

                // Goal 4: System Design
                Goal learningGoal = new Goal(
                        "Complete System Design Mastery",
                        "Read and summarize 5 major distributed system whitepapers and case studies.",
                        "Education",
                        "Low",
                        0,
                        "Not Started",
                        LocalDate.now(),
                        LocalDate.now().plusMonths(3),
                        demoUser
                );
                goalRepository.save(learningGoal);

                // Seed Daily Progress Logs for demonstration
                if (dailyProgressRepository.count() == 0) {
                    LocalDate today = LocalDate.now();
                    dailyProgressRepository.save(new DailyProgress(demoUser, javaGoal, today.minusDays(6), 35, "Mastered Java Collections and streams syntax. Solved 10 LeetCode problems."));
                    dailyProgressRepository.save(new DailyProgress(demoUser, fitnessGoal, today.minusDays(5), 45, "Completed 5km morning run. Pace 5:15/km. Feeling great energy."));
                    dailyProgressRepository.save(new DailyProgress(demoUser, javaGoal, today.minusDays(4), 50, "Studied multi-threading and concurrency constructs in JVM."));
                    dailyProgressRepository.save(new DailyProgress(demoUser, javaGoal, today.minusDays(3), 60, "Configured Spring Boot REST controllers and DTO validation layers."));
                    dailyProgressRepository.save(new DailyProgress(demoUser, fitnessGoal, today.minusDays(2), 70, "Interval sprint session at the park. 7km run completed."));
                    dailyProgressRepository.save(new DailyProgress(demoUser, javaGoal, today.minusDays(1), 80, "Implemented Spring Security 6 stateless JWT authentication filter."));
                    dailyProgressRepository.save(new DailyProgress(demoUser, javaGoal, today, 85, "Built progress tracking system with statistics calculation and live chart visualizations."));
                }

                // Seed Notifications
                if (notificationRepository.count() == 0) {
                    notificationRepository.save(new Notification(demoUser, "Your Java task is due tomorrow.", "TASK_DUE", false, LocalDateTime.now().minusHours(1)));
                    notificationRepository.save(new Notification(demoUser, "Congratulations! You completed a goal.", "GOAL_COMPLETED", false, LocalDateTime.now().minusHours(4)));
                    notificationRepository.save(new Notification(demoUser, "You're on a 7-day streak 🔥", "STREAK", false, LocalDateTime.now().minusHours(8)));
                }
            }
        };
    }
}
