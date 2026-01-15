package com.crm.controller;

import com.crm.model.dto.ResponseDTO;
import com.crm.service.NotificationService;
import com.crm.utility.RequestValidator;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    NotificationService notificationService;
    
    @PostMapping("/create")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> createNotification(@RequestBody Map<String, ?> request) {

        LOGGER.info(" createNotificationRequest Received");
        
        new RequestValidator(request).hasId("id", true)
        .hasString("notificationTitle")
        .hasString("notificationText");

       // Notification notification = notificationService.createNotification(request);
        notificationService.createNotification(request);
        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("message", "Notification created successfully.");
       // responseAttributes.put("notificationId", notification.getNotificationId());

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);

        return ResponseEntity.ok(responseDTO);
    }


    @PostMapping("/get-all")
    public ResponseEntity<ResponseDTO<Map<String, Object>>>  getAllNotifications(@RequestBody Map<String, ?> request) {

        LOGGER.info(" getAllNotificationsRequest Received");
        new RequestValidator(request).hasId("id", true); 
        
        Long employeeId = Long.parseLong(request.get("id").toString());

        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("notifications", notificationService.getAllNotificationsFor(employeeId));

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);

        return ResponseEntity.ok(responseDTO);

    }

    @PostMapping("/mark-seen")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> markAsSeen(@RequestBody Map<String, ?> request) {

        LOGGER.info(" markAsSeenRequest Received");
        new RequestValidator(request).hasId("notificationId", true);
        	Long notificationId = Long.parseLong(request.get("notificationId").toString());
        	
        notificationService.seeNotification(notificationId);
        
        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("message", "Notification marked as seen.");

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);

        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/mark-unseen")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> markAsUnSeen(@RequestBody Map<String, ?> request) {

        LOGGER.info(" markAsUnSeenRequest Received");
        new RequestValidator(request).hasId("notificationId", true);
        	
        Long notificationId = Long.parseLong(request.get("notificationId").toString());
        
        notificationService.unSeeNotification(notificationId);
        
        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("message", "Notification marked as unseen.");

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);

        return ResponseEntity.ok(responseDTO);
    }



}
