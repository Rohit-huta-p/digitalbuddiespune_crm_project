package com.crm.repos;

import com.crm.model.Notification;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByEmployeeId(Long employeeId);

    void deleteByEmployeeId(Long employeeId);
}
