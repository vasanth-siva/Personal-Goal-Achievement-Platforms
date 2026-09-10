package com.goalforge.repository;

import com.goalforge.entity.Achievement;
import com.goalforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    List<Achievement> findByUserOrderByUnlockedAtDesc(User user);

    boolean existsByUserAndAchievementType(User user, String achievementType);

    Optional<Achievement> findByUserAndAchievementType(User user, String achievementType);

    long countByUser(User user);

    void deleteAllByUser(User user);
}
