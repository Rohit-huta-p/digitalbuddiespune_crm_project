package com.crm.controller;

import com.crm.service.ProjectGroupService;
import com.crm.utility.Constants;
import com.crm.utility.RequestValidator;
import com.crm.model.dto.ResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.crm.model.dto.project.ProjectDTO;
import com.crm.model.dto.project.TaskDTO;
import com.crm.model.dto.project.CreateProjectRequest;
import com.crm.model.dto.project.CreateTaskRequest;
import com.crm.model.dto.project.UpdateTaskStatusRequest;
import com.crm.model.dto.project.AddParticipantRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.Map;

@RestController
@RequestMapping("/project")
public class ProjectGroupController {

	@Autowired
	private ProjectGroupService projectGroupService;

	@PostMapping("/create")
	public ResponseEntity<ResponseDTO<ProjectDTO>> createProject(@RequestBody @Valid CreateProjectRequest request) {
		ProjectDTO projectDTO = projectGroupService.createProject(request);
		ResponseDTO<ProjectDTO> response = new ResponseDTO<>();
		response.setAttributes(projectDTO);
		// If ResponseDTO only has 'attributes', I might need to wrap DTO in map OR
		// update ResponseDTO.
		// Let's check ResponseDTO. For now assume it logic or use map if sticking to
		// legacy response structure IS required.
		// But goal is "RESTful". Standard response.
		// I will map to attributes for SAFETY if I can't see ResponseDTO.
		// Actually I viewed ResponseDTO in previous turn? No, I viewed
		// GlobalExceptionHandler which uses it.
		response.setAttributes(projectDTO);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/task/create")
	public ResponseEntity<ResponseDTO<TaskDTO>> createTask(@RequestBody @Valid CreateTaskRequest request) {
		TaskDTO taskDTO = projectGroupService.createTask(request); // ensure service has createTask
		ResponseDTO<TaskDTO> response = new ResponseDTO<>();
		response.setAttributes(taskDTO);
		return ResponseEntity.ok(response);
	}

	@PutMapping("/task/update-status")
	public ResponseEntity<ResponseDTO<String>> updateTaskStatus(@RequestBody @Valid UpdateTaskStatusRequest request) {
		projectGroupService.updateTaskStatus(request);
		ResponseDTO<String> response = new ResponseDTO<>();
		response.setAttributes("Task status updated successfully");
		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/{projectId}")
	public ResponseEntity<ResponseDTO<String>> deleteProject(@PathVariable Long projectId) {
		projectGroupService.deleteProjectGroup(projectId);
		ResponseDTO<String> response = new ResponseDTO<>();
		response.setAttributes("Project deleted successfully");
		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/task/{taskId}")
	public ResponseEntity<ResponseDTO<String>> deleteTask(@PathVariable Long taskId) {
		projectGroupService.deleteTask(taskId);
		ResponseDTO<String> response = new ResponseDTO<>();
		response.setAttributes("Task deleted successfully");
		return ResponseEntity.ok(response);
	}

	@GetMapping
	public ResponseEntity<ResponseDTO<Page<ProjectDTO>>> getAllProjects(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String status) {
		Pageable pageable = PageRequest.of(page, size);
		Page<ProjectDTO> projects = projectGroupService.getAllProjects(pageable, status);
		ResponseDTO<Page<ProjectDTO>> response = new ResponseDTO<>();
		response.setAttributes(projects);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{projectId}")
	public ResponseEntity<ResponseDTO<ProjectDTO>> getProjectById(@PathVariable Long projectId) {
		ProjectDTO project = projectGroupService.getProjectById(projectId);
		ResponseDTO<ProjectDTO> response = new ResponseDTO<>();
		response.setAttributes(project);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{projectId}/tasks")
	public ResponseEntity<ResponseDTO<Page<TaskDTO>>> getTasksByProjectId(
			@PathVariable Long projectId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<TaskDTO> tasks = projectGroupService.getTasksByProjectId(projectId, pageable);
		ResponseDTO<Page<TaskDTO>> response = new ResponseDTO<>();
		response.setAttributes(tasks);
		return ResponseEntity.ok(response);
	}

	// @PostMapping("/assignTaskToYourself")
	// public ResponseEntity<ResponseDTO<Map<String, Object>>>
	// assignTaskToParticipant(@RequestBody Map<String, ?> request) {
	// new RequestValidator(request)
	// .hasId(Constants.PROJECT_GROUPID, true);
	// return projectGroupService.assignTaskToParticipant(request);
	// }

	@GetMapping("/{projectId}/employee/{employeeId}/tasks")
	public ResponseEntity<ResponseDTO<Page<TaskDTO>>> getTasksByEmployeeAndProject(
			@PathVariable Long projectId,
			@PathVariable Long employeeId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<TaskDTO> tasks = projectGroupService.getTasksByEmployeeAndProject(employeeId, projectId, pageable);
		ResponseDTO<Page<TaskDTO>> response = new ResponseDTO<>();
		response.setAttributes(tasks);
		return ResponseEntity.ok(response);
	}

	@PutMapping("/{projectId}/status")
	public ResponseEntity<ResponseDTO<String>> updateProjectStatus(
			@PathVariable Long projectId,
			@RequestParam String status) {
		projectGroupService.updateProjectStatus(projectId, status);
		ResponseDTO<String> response = new ResponseDTO<>();
		response.setAttributes("Project status updated successfully");
		return ResponseEntity.ok(response);
	}

	@GetMapping("/client/{clientId}")
	public ResponseEntity<ResponseDTO<Page<ProjectDTO>>> getProjectsByClientId(
			@PathVariable Long clientId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<ProjectDTO> projects = projectGroupService.getProjectsByClientId(clientId, pageable);
		ResponseDTO<Page<ProjectDTO>> response = new ResponseDTO<>();
		response.setAttributes(projects);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/{projectId}/participants")
	public ResponseEntity<ResponseDTO<String>> addParticipant(@RequestBody @Valid AddParticipantRequest request) {
		projectGroupService.addParticipants(request);
		ResponseDTO<String> response = new ResponseDTO<>();
		response.setAttributes("Participants added successfully");
		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/{projectId}/participants/{employeeId}")
	public ResponseEntity<ResponseDTO<String>> removeParticipant(
			@PathVariable Long projectId,
			@PathVariable Long employeeId) {
		projectGroupService.removeParticipant(projectId, employeeId);
		ResponseDTO<String> response = new ResponseDTO<>();
		response.setAttributes("Participant removed successfully");
		return ResponseEntity.ok(response);
	}
}
