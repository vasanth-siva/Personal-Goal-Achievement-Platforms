package com.goalforge.repository;

import com.goalforge.entity.DailyProgress;
import com.goalforge.entity.Goal;
import com.goalforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyProgressRepository extends JpaRepository<DailyProgress, Long> {

    List<DailyProgress> findByUserOrderByProgressDateDescCreatedAtDesc(User user);

    List<DailyProgress> findByUserAndProgressDateBetweenOrderByProgressDateAsc(User user, LocalDate startDate, LocalDate endDate);

    Optional<DailyProgress> findByIdAndUser(Long id, User user);

    List<DailyProgress> findByUserAndGoalOrderByProgressDateDesc(User user, Goal goal);

    boolean existsByUserAndProgressDate(User user, LocalDate progressDate);

    List<DailyProgress> findByUser(User user);

    void deleteByIdAndUser(Long id, User user);
}
