package com.crm.controller;

import com.crm.service.ProjectGroupService;
import com.crm.utility.Constants;
import com.crm.utility.RequestValidator;
import com.crm.model.dto.ResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/project")
public class ProjectGroupController {

	@Autowired
	private ProjectGroupService projectGroupService;

	// ✅ Create a project group and assign tasks
	@PostMapping("/group-create")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> createProjectGroup(@RequestBody Map<String, ?> request) {
//    		
		new RequestValidator(request).hasValidAssignBy(Constants.CREATED_BY_ID).hasString(Constants.PROJECT_NAME)
				.hasString(Constants.PROJECT_DESC).hasValidParticipants(Constants.PARTICIPANTS)
				.hasValidParticipantIds(Constants.GROUPLEADER_ID)
				.hasId(Constants.CLIENT_ID,false)
				.hasId(Constants.COMPANY_ID, true);

		
		return projectGroupService.createProjectGroup(request);
	}

	@PostMapping("/task/schedule")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> scheduleTask(@RequestBody Map<String, ?> request) {
		new RequestValidator(request).hasId(Constants.PROJECT_GROUPID, true)
							.hasId(Constants.COMPANY_ID, true);
		return projectGroupService.scheduleTask(request);
	}

	// ✅ Update task status and notify next participant
	@PostMapping("/update")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> updateTaskStatus(@RequestBody Map<String, ?> request) {

		new RequestValidator(request).hasId(Keys.EMPLOYEE_ID, true).hasId(Constants.FIELD_TASK_ID, true)
				.hasValidTaskStatus(Constants.FIELD_STATUS)
				.hasId(Constants.COMPANY_ID, true);

		
		// Response
		projectGroupService.updateTaskStatus(request);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("Message", "Task status updated successfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/delete")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> deleteProject(@RequestBody Map<String, ?> request) {

		new RequestValidator(request).hasId(Constants.PROJECT_GROUPID, true)
					.hasId(Constants.COMPANY_ID, true);
		Long projectId = Long.parseLong(request.get(Constants.PROJECT_GROUPID).toString());
		projectGroupService.deleteProjectGroup(projectId,request);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("Message", "Project deleted successfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	// ✅ Delete a task from the project
	@PostMapping("/task/delete")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> deleteTask(@RequestBody Map<String, ?> request) {

		new RequestValidator(request).hasId(Constants.PROJECT_GROUPID, true).hasId(Constants.FIELD_TASK_ID, true)
				.hasId(Constants.COMPANY_ID, true);

		Long projectGroupId = Long.parseLong(request.get(Constants.PROJECT_GROUPID).toString());
		Long taskId = Long.parseLong(request.get(Constants.FIELD_TASK_ID).toString());

		projectGroupService.deleteTask(projectGroupId, taskId,request);

		// Response
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("Message", "Task deleted successfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/get-all-projects")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllProjects(
			@RequestParam(name = "num", required = true) Integer pageNum,
			@RequestParam(name = "size", required = true) Integer pageSize,@RequestBody Map<String,?>request) {
		
		new RequestValidator(request)
			.hasId(Constants.COMPANY_ID, true)
			.hasPagination(pageNum, pageSize);
		return projectGroupService.getAllProjects(pageNum, pageSize,request);
	}
	
	@PostMapping(value = "/get-project-by-id")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getProjectById(@RequestBody Map<String, ?> entity) {
	    new RequestValidator(entity).hasId(Constants.PROJECT_GROUPID, true)
	    	.hasId(Constants.COMPANY_ID,true);
	    return projectGroupService.getProjectById(entity);
	}

	@PostMapping("/get-tasks")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getTasksByProjectId(
            @RequestBody Map<String, ?> entity,
            @RequestParam(name = "num", required = true) Integer pageNum,
            @RequestParam(name = "size", required = true) Integer pageSize) {

		new RequestValidator(entity).hasId(Constants.PROJECT_GROUPID, true)
		.hasPagination(pageNum, pageSize).hasId(Constants.COMPANY_ID, true);
        return projectGroupService.getTasksByProjectId(entity, pageNum, pageSize);
    }
	
//	@PostMapping("/assignTaskToYourself")
//	public ResponseEntity<ResponseDTO<Map<String, Object>>> assignTaskToParticipant(@RequestBody Map<String, ?> request) {
//			new RequestValidator(request)
//				.hasId(Constants.PROJECT_GROUPID, true);
//	    return projectGroupService.assignTaskToParticipant(request);
//	}
	
	@PostMapping("/getTaskEmployeeByProjectId")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getTasksForEmployeeInProject(@RequestBody Map<String,?>request)
	      {
		
		new RequestValidator(request)
			.hasId(Keys.ID, true)
			.hasId(Constants.PROJECT_GROUPID, true)
			.hasId(Constants.COMPANY_ID, true);
		Long employeeId=Long.parseLong(request.get(Keys.ID).toString());
		Long projectId=Long.parseLong(request.get(Constants.PROJECT_GROUPID).toString());
	    return projectGroupService.getTasksByEmployeeAndProject(employeeId, projectId,request);
	}

	@PostMapping("/markProjectStatus")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> markProjectStatus(@RequestBody Map<String, ?> request) {
	    new RequestValidator(request)
	        .hasId(Constants.PROJECT_GROUPID, true)
	        .hasValidTaskStatus(Constants.FIELD_STATUS)
	        .hasId(Constants.COMPANY_ID,true);

	    Long projectId = Long.parseLong(request.get(Constants.PROJECT_GROUPID).toString());
	    String newStatus = request.get(Constants.FIELD_STATUS).toString();

	    return projectGroupService.markProjectStatus(projectId, newStatus,request);
	}


}
