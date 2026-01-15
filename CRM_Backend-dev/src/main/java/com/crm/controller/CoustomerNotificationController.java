package com.crm.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crm.model.CoustomerNotification;
import com.crm.model.dto.ResponseDTO;
import com.crm.service.CoustomerNotificationService;
import com.crm.utility.Constants;
import com.crm.utility.RequestValidator;

@RestController
@RequestMapping("/coustomerNotification")
public class CoustomerNotificationController {

	@Autowired
	CoustomerNotificationService coustomerNotificationService;
	
	@PostMapping("/create")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> createNotification(@RequestBody Map<String, ?> request) {

       // LOGGER.info(" createNotificationRequest Received");
        
        new RequestValidator(request).hasId(Constants.COUSTOMER_ID, true)
        .hasString(Constants.FIELD_NOTIFICATION_TITLE)
        .hasString(Constants.FIELD_NOTIFICATION_TEXT);

       // Notification notification = notificationService.createNotification(request);
        coustomerNotificationService.createNotification(request);
        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("message", "Notification created successfully.");
      
        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);

        return ResponseEntity.ok(responseDTO);
    }
	
	@PostMapping("/getById")
	 public ResponseEntity<ResponseDTO<Map<String, Object>>> getNotification(@RequestBody Map<String, ?> request)
	 {
		Long customerId = Long.valueOf(request.get(Constants.COUSTOMER_ID).toString());
	    List<CoustomerNotification> notifications = coustomerNotificationService.getAllNotificationById(customerId);

	    Map<String, Object> response = new HashMap<>();
	    response.put("notifications", notifications);
	    
	    ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(response);

        return ResponseEntity.ok(responseDTO);
	    
	 }
	@PostMapping("/mark-seen")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> markAsSeen(@RequestBody Map<String, ?> request) {

      //  LOGGER.info(" markAsSeenRequest Received");
        new RequestValidator(request).hasId(Constants.COUSTOMER_NOTIFICATION_ID, true);
        	Long notificationId = Long.parseLong(request.get(Constants.COUSTOMER_NOTIFICATION_ID).toString());
        	
        	coustomerNotificationService.seeNotification(notificationId);
        
        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("message", "Notification marked as seen.");

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);

        return ResponseEntity.ok(responseDTO);
    }
	
	@PostMapping("/mark-unseen")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> markAsUnSeen(@RequestBody Map<String, ?> request) {

        //LOGGER.info(" markAsUnSeenRequest Received");
        new RequestValidator(request).hasId(Constants.COUSTOMER_NOTIFICATION_ID, true);
        	
        Long notificationId = Long.parseLong(request.get(Constants.COUSTOMER_NOTIFICATION_ID).toString());
        
        coustomerNotificationService.unSeeNotification(notificationId);
        
        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("message", "Notification marked as unseen.");

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);

        return ResponseEntity.ok(responseDTO);
    }
}
