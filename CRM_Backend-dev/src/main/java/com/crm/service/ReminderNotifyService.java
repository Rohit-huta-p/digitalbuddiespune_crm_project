package com.crm.service;

import com.crm.model.dto.NotifyDto;
import com.crm.repos.NotifyRepository;
import com.crm.repos.TaskManagementRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReminderNotifyService {

	private static final Logger LOGGER = LoggerFactory.getLogger(ReminderNotifyService.class);

	@Autowired
	NotifyRepository notificationRepository;

	@Autowired
	ReminderNotifyEmailService notificationEmailService;

	@Scheduled(cron = "0 0 7 * * ?") // Run Every Day at 7 AM
	public void sendDailyDueNotifications() {

		LOGGER.info("Executing sendDailyDueNotifications()");

		sendDueDateNotifications();
	}

	public ResponseEntity<?> sendDueDateNotifications() {

		LOGGER.info("Executing sendDueDateNotifications()");

		List<NotifyDto> dueTasks = notificationRepository.findByDeadlineTimestamp();

		for (NotifyDto task : dueTasks) {
			String emailBody = "Dear " + task.getId() + ",\n\n" + "This is a reminder that your task '"
					+ task.getTaskName() + "' is due today.\n" + "Please ensure to complete it on time.\n\n"
					+ "Best regards,\nYour Task Management System";

			notificationEmailService.sendEmail(task.getEmail(), "Task Due Reminder", emailBody);
		}
		return null;
	}

}
