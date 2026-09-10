package com.goalforge.repository;

import com.goalforge.entity.GoalPhase;
import com.goalforge.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByPhaseOrderByCreatedAtAsc(GoalPhase phase);

    List<Task> findByPhase(GoalPhase phase);

    Optional<Task> findByIdAndPhase(Long id, GoalPhase phase);

    boolean existsByIdAndPhase(Long id, GoalPhase phase);

    void deleteByPhase(GoalPhase phase);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Task t WHERE t.phase.goal.user.email = :email ORDER BY CASE WHEN t.dueDate IS NULL THEN 1 ELSE 0 END, t.dueDate ASC, t.createdAt DESC")
    List<Task> findAllByUserEmail(@org.springframework.data.repository.query.Param("email") String email);
}
