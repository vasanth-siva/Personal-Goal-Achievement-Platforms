package com.goalforge.service;

import com.goalforge.dto.*;
import com.goalforge.entity.Goal;
import com.goalforge.entity.User;
import com.goalforge.exception.ResourceNotFoundException;
import com.goalforge.repository.GoalRepository;
import com.goalforge.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final DailyProgressService dailyProgressService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       GoalRepository goalRepository,
                       DailyProgressService dailyProgressService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
        this.dailyProgressService = dailyProgressService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(String email) {
        User user = getUser(email);
        return buildProfileDto(user);
    }

    public UserProfileDto updateProfile(String email, UpdateProfileRequest request) {
        User user = getUser(email);

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getAvatar() != null && !request.getAvatar().isBlank()) {
            user.setAvatar(request.getAvatar().trim());
        }

        User updated = userRepository.save(user);
        return buildProfileDto(updated);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUser(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password does not match.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match.");
        }

        if (request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public UserProfileDto updatePreferences(String email, UpdatePreferencesRequest request) {
        User user = getUser(email);

        if (request.getThemePreference() != null && !request.getThemePreference().isBlank()) {
            user.setThemePreference(request.getThemePreference().trim());
        }
        if (request.getNotifyTaskDue() != null) {
            user.setNotifyTaskDue(request.getNotifyTaskDue());
        }
        if (request.getNotifyGoalCompleted() != null) {
            user.setNotifyGoalCompleted(request.getNotifyGoalCompleted());
        }
        if (request.getNotifyStreak() != null) {
            user.setNotifyStreak(request.getNotifyStreak());
        }
        if (request.getNotifyWeeklyDigest() != null) {
            user.setNotifyWeeklyDigest(request.getNotifyWeeklyDigest());
        }

        User updated = userRepository.save(user);
        return buildProfileDto(updated);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private UserProfileDto buildProfileDto(User user) {
        List<Goal> goals = goalRepository.findByUser(user);
        int totalGoals = goals.size();
        int completedGoals = (int) goals.stream()
                .filter(g -> "Completed".equalsIgnoreCase(g.getStatus()) || (g.getProgress() != null && g.getProgress() == 100))
                .count();

        int currentStreak = 0;
        try {
            ProgressStatisticsDto stats = dailyProgressService.calculateProgressStatistics(user.getEmail());
            currentStreak = stats.getCurrentStreak() != null ? stats.getCurrentStreak() : 0;
        } catch (Exception ignored) {
        }

        return new UserProfileDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getAvatar() != null ? user.getAvatar() : "🚀",
                user.getCreatedAt(),
                totalGoals,
                completedGoals,
                currentStreak,
                user.getThemePreference() != null ? user.getThemePreference() : "system",
                user.getNotifyTaskDue() != null ? user.getNotifyTaskDue() : true,
                user.getNotifyGoalCompleted() != null ? user.getNotifyGoalCompleted() : true,
                user.getNotifyStreak() != null ? user.getNotifyStreak() : true,
                user.getNotifyWeeklyDigest() != null ? user.getNotifyWeeklyDigest() : false
        );
    }
}
