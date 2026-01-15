package com.crm.service;

import com.crm.controller.Keys;
import com.crm.exception.NotFoundException;
import com.crm.model.Notification;
import com.crm.repos.NotificationRepository;
import com.crm.utility.Constants;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    // 🔹 Create notification from request map (for manual triggers)
    public Notification createNotification(Map<String, ?> request) {
        Long employeeId = Long.parseLong(request.get(Keys.ID).toString());
        String notificationTitle = request.get(Constants.FIELD_NOTIFICATION_TITLE).toString();
        String notificationText = request.get(Constants.FIELD_NOTIFICATION_TEXT).toString();

        Notification notification = new Notification();
        notification.setEmployeeId(employeeId);
        notification.setNotificationTitle(notificationTitle);
        notification.setNotificationText(notificationText);
        notification.setNotificationTime(LocalDateTime.now());
        notification.setSeen(false);

        return notificationRepository.save(notification);
    }

    // 🔹 Get all notifications for employee
    public Object getAllNotificationsFor(Long employeeId) {
        LOGGER.info("Executing getAllNotificationsFor()");
        List<Notification> notifications = notificationRepository.findByEmployeeId(employeeId);
        if (notifications == null || notifications.isEmpty()) {
            throw new NotFoundException("No notifications found for employee ID: " + employeeId);
        }
        return notifications;
    }

    // 🔹 For dashboard (no exception)
    public Object getAllNotificationsById(Long employeeId) {
        LOGGER.info("Executing getAllNotificationsById()");
        List<Notification> notifications = notificationRepository.findByEmployeeId(employeeId);
        return (notifications != null) ? notifications : Collections.emptyList();
    }

    @Transactional
    public void seeNotification(Long notificationId) {
        LOGGER.info("Executing seeNotification()");
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        notification.setSeen(true);
        notificationRepository.save(notification);
    }

    public void unSeeNotification(Long notificationId) {
        LOGGER.info("Executing unSeeNotification()");
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        notification.setSeen(false);
        notificationRepository.save(notification);
    }

    // ✅ Fixed: System-triggered notification with explicit employeeId
    // ✅ Fixed: System-triggered notification with explicit employeeId
    public void sendSystemNotification(Long employeeId, String title, String text) {
        try {
            Notification notification = new Notification();
            notification.setEmployeeId(employeeId);
            notification.setNotificationTitle(title);
            notification.setNotificationText(text);
            notification.setNotificationTime(LocalDateTime.now());
            notification.setSeen(false);
            notificationRepository.save(notification);

            LOGGER.info("✅ System notification sent to employeeId: {} -> {}", employeeId, title);
        } catch (Exception e) {
            LOGGER.error("❌ Failed to send system notification: {}", e.getMessage());
        }
    }

}
