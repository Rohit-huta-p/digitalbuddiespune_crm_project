package com.crm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crm.controller.Keys;
import com.crm.exception.NotFoundException;
import com.crm.model.CoustomerNotification;
import com.crm.model.Notification;
import com.crm.repos.CoustomerNotificationRepository;
import com.crm.utility.Constants;

@Service
public class CoustomerNotificationService {

	@Autowired
	private CoustomerNotificationRepository coustomerNotificationRepository;
	
	 public CoustomerNotification createNotification(Map<String, ?> request) {
	    	
    	 Long coustomerId = Long.parseLong(request.get(Constants.COUSTOMER_ID).toString());
    	    String notificationTitle = request.get(Constants.FIELD_NOTIFICATION_TITLE).toString();
    	    String notificationText = request.get(Constants.FIELD_NOTIFICATION_TEXT).toString();

    	    // Create and save the notification
    	    CoustomerNotification notification = new CoustomerNotification();
    	    notification.setCoustomerId(coustomerId);
    	    notification.setNotificationTitle(notificationTitle);
    	    notification.setNotificationText(notificationText);
    	    notification.setNotificationTime(LocalDateTime.now());
    	    notification.setSeen(false);

    	    return coustomerNotificationRepository.save(notification);
    	
    }
	 
	  public List<CoustomerNotification> getAllNotificationById(Long coustomerId) {

	       // LOGGER.info("Executing getAllNotificationsFor()");
	        List<CoustomerNotification> notifications = coustomerNotificationRepository.findByCoustomerId(coustomerId);
	        
	        if (notifications == null || notifications.isEmpty()) {
	            throw new NotFoundException("No notifications found for employee ID: " + coustomerId);
	        }
	        return notifications;

	    }
	  
	  public void seeNotification(Long coustomerNotificationId) {

	      //  LOGGER.info("Executing seeNotification()");

	        CoustomerNotification notification = coustomerNotificationRepository.findById(coustomerNotificationId)
	                .orElseThrow(() -> new NotFoundException("Notification not found"));
	        notification.setSeen(true);
	        coustomerNotificationRepository.save(notification);

	    }

	    public void unSeeNotification(Long coustomerNotificationId) {

	      //  LOGGER.info("Executing unSeeNotification()");

	        CoustomerNotification notification = coustomerNotificationRepository.findById(coustomerNotificationId)
	                .orElseThrow(() -> new NotFoundException("Notification not found"));
	        notification.setSeen(false);
	        coustomerNotificationRepository.save(notification);

	    }
    
}
