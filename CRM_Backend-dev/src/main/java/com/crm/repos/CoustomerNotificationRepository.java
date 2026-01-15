package com.crm.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crm.model.CoustomerNotification;
import com.crm.model.Notification;

@Repository
public interface CoustomerNotificationRepository extends JpaRepository<CoustomerNotification, Long> {
	List<CoustomerNotification>  findByCoustomerId(Long coustomerId);
}
