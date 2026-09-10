package com.goalforge.repository;

import com.goalforge.entity.Goal;
import com.goalforge.entity.GoalPhase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalPhaseRepository extends JpaRepository<GoalPhase, Long> {

    List<GoalPhase> findByGoalOrderByPhaseOrderAsc(Goal goal);

    Optional<GoalPhase> findByIdAndGoal(Long id, Goal goal);

    boolean existsByIdAndGoal(Long id, Goal goal);

    void deleteByGoal(Goal goal);
}
