package com.goalforge.repository;

import com.goalforge.entity.Notification;
import com.goalforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndIsReadFalse(User user);

    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    boolean existsByUserAndMessage(User user, String message);

    void deleteByUser(User user);
}
