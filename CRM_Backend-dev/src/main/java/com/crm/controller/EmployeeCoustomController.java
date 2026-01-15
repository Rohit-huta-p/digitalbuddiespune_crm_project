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

import com.crm.model.Employee;
import com.crm.model.Notification;
import com.crm.model.dto.ResponseDTO;
import com.crm.service.Employee_Service;
import com.crm.service.NotificationService;
import com.crm.service.TaskManagementService;
import com.crm.utility.RequestValidator;

@RestController
@RequestMapping("employee")
public class EmployeeCoustomController {
	
	@Autowired
	Employee_Service employee_Service;
	
	@Autowired
	NotificationService notificationService;
	
	@Autowired
	TaskManagementService taskManagementService;
	 
	@PostMapping("/dashboard")
	public ResponseEntity<ResponseDTO<Map<String,Object>>> employeeDashboard(@RequestBody Map<String,?> request)
	{
		
		new RequestValidator(request)	
			.hasId(Keys.ID, true);
		
		Long id =Long.parseLong(request.get(Keys.ID).toString());
		
		//Employee employee=employee_Service.getEmployeeById(id);
		@SuppressWarnings("unchecked")
		List<Notification> notifications=(List<Notification>) notificationService.getAllNotificationsById(id);
		
		Map<String,Object> response=new HashMap<>();
		//response.put("EmployeeProfile", employee);
		response.put("Notifications", notifications);
		
		ResponseDTO<Map<String,Object>> responseAttribute =new ResponseDTO<>();
		responseAttribute.setAttributes(response);
		return ResponseEntity.ok(responseAttribute);
		
	}

}
