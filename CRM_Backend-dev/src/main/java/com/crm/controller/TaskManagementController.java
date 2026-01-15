package com.crm.controller;

import com.crm.model.dto.ResponseDTO;

import com.crm.service.WorkTimeLocationService;
import com.crm.utility.Constants;
import com.crm.utility.RequestValidator;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.crm.service.TaskManagementService;
import org.slf4j.Logger;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/task")
//@CrossOrigin(origins = "http://localhost:3000") 
public class TaskManagementController {

	private static final Logger LOGGER = LoggerFactory.getLogger(TaskManagementController.class);

	@Autowired
	TaskManagementService taskManagementService;

    @Autowired
    private WorkTimeLocationService workTimeLocationService;


    @PostMapping("/createTask")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> createTask(@RequestBody Map<String, ?> taskData) {

		new RequestValidator(taskData).hasString(Constants.FIELD_TASK_NAME).hasString(Constants.FIELD_DESCRIPTION)
				.hasEmail(Constants.FIELD_EMAIL,false).hasValidDateTime(Constants.FIELD_DEADLINE_TIMESTAMP)
				.hasValidTaskStatus(Constants.FIELD_STATUS).hasValidAssignBy(Constants.FIELD_ASSIGNED_BY)
				.hasValidParticipantIds(Constants.FIELD_ASSIGNED_TO_EMPLOYEE_ID)
				.hasValidPriority(Constants.PRIORITY)
				.hasId(Constants.COMPANY_ID,true);

		taskManagementService.createTask(taskData);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Task created successfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);

	}

	@PostMapping("/createGroupTask")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> createGroupTask(@RequestBody Map<String, ?> taskData) {
//        if (!taskData.containsKey(Constants.FIELD_GROUP_ID)) {
//            throw new BadRequestException("groupId is required.");
//        }
		new RequestValidator(taskData).hasString(Constants.FIELD_TASK_NAME).hasString(Constants.FIELD_DESCRIPTION)
				.hasEmail(Constants.FIELD_EMAIL).hasValidDateTime(Constants.FIELD_DEADLINE_TIMESTAMP)
				.hasValidTaskStatus(Constants.FIELD_STATUS).hasLong(Constants.FIELD_ASSIGNED_BY)
				.hasValidParticipantIds(Constants.FIELD_ASSIGNED_TO_EMPLOYEE_ID).hasId(Keys.GROUPID, true);

		Long groupId = Long.valueOf(taskData.get(Keys.GROUPID).toString());
		taskManagementService.createGroupTask(taskData, groupId);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Task created successfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);

	}

	@PostMapping("/getAll")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllTasks(@RequestBody Map<String,?>request) {
		
		new RequestValidator(request)
			.hasId(Constants.COMPANY_ID, true);

		List<Map<String, Object>> task = taskManagementService.getAllTasks(request);
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("TaskManagement", task);

		ResponseDTO<Map<String, Object>> responseDto = new ResponseDTO<>();
		responseDto.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDto);
	}

	@PostMapping("/update")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> updateTask(@RequestBody Map<String, ?> taskData) {

		new RequestValidator(taskData).hasLong(Keys.ID)
			.hasId(Constants.COMPANY_ID, true);
//    	.hasString(Constants.FIELD_TASK_NAME)
//        .hasString(Constants.FIELD_DESCRIPTION)
//    	.hasEmail(Constants.FIELD_EMAIL)
//    	.hasValidDateTime(Constants.FIELD_DEADLINE_TIMESTAMP)
//    	.hasValidTaskStatus(Constants.FIELD_STATUS)
//    	.hasValidAssignBy(Constants.FIELD_ASSIGNED_BY)
//    	.hasValidParticipantIds(Constants.FIELD_ASSIGNED_TO_EMPLOYEE_ID);

		long id = Long.parseLong(taskData.get(Keys.ID).toString());

		taskManagementService.updateTask(id, taskData);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Task updated successfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/updateGroupTask")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> updateGroupTask(@RequestBody Map<String, ?> taskData) {

		// Validate the request data
		new RequestValidator(taskData).hasLong(Keys.ID).hasString(Constants.FIELD_TASK_NAME)
				.hasString(Constants.FIELD_DESCRIPTION).hasEmail(Constants.FIELD_EMAIL)
				.hasValidDateTime(Constants.FIELD_DEADLINE_TIMESTAMP).hasValidTaskStatus(Constants.FIELD_STATUS)
				.hasLong(Constants.FIELD_ASSIGNED_BY).hasValidParticipantIds(Constants.FIELD_ASSIGNED_TO_EMPLOYEE_ID);

		// Extract the task ID from the request
		long id = Long.parseLong(taskData.get(Keys.ID).toString());

		// Call the service to update the task
		taskManagementService.updateGroupTask(id, taskData);

		// Prepare the response attributes
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Task updated successfully");

		// Wrap the response inside ResponseDTO
		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		// Return the response wrapped in ResponseEntity
		return ResponseEntity.ok(responseDTO);
	}
    @PostMapping("/attendanceHistory")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getAttendanceHistory(@RequestBody Map<String, ?> request) {
        Long employeeId = Long.parseLong(request.get("employeeId").toString());

        List<Map<String, Object>> history = workTimeLocationService.getAttendanceHistory(employeeId);

        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("attendanceHistory", history);

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);

        return ResponseEntity.ok(responseDTO);
    }



    @PostMapping("/getByEmployeeId")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getTasksByEmployeeId(@RequestBody Map<String, ?> request) {

		new RequestValidator(request).hasId(Keys.ID, false)
			.hasId(Constants.COMPANY_ID, false);

	

		List<Map<String, Object>> tasks = taskManagementService.getTasksByEmployeeId(request);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("tasks", tasks);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/delete")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> deleteTask(@RequestBody Map<String, ?> requestData) {

		new RequestValidator(requestData).hasLong(Keys.ID)
			.hasId(Constants.COMPANY_ID, true);

		long id = Long.parseLong(requestData.get(Keys.ID).toString());
		taskManagementService.deleteTask(id,requestData);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Task Deleted SuccessFully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);

	}

	@PostMapping("/assignTaskToSelf")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> assignTaskToSelf(@RequestBody Map<String, ?> taskData) {

		new RequestValidator(taskData).hasString(Constants.FIELD_TASK_NAME).hasString(Constants.FIELD_DESCRIPTION)
				.hasEmail(Constants.FIELD_EMAIL,false).hasValidDateTime(Constants.FIELD_DEADLINE_TIMESTAMP)
				.hasValidTaskStatus(Constants.FIELD_STATUS).hasString(Constants.FIELD_ASSIGNED_BY)
				.hasValidParticipantIds(Constants.FIELD_ASSIGNED_TO_EMPLOYEE_ID)
				.hasValidPriority(Constants.PRIORITY)
				.hasId(Constants.COMPANY_ID,true);
		// Call the service method to assign the task
		taskManagementService.assignTaskToSelf(taskData);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Task assigned successfully to yourself.");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

}
