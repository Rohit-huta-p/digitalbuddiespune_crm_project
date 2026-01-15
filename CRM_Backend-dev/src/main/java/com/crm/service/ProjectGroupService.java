package com.crm.service;

import com.crm.controller.BillController;
import com.crm.controller.Keys;
import com.crm.exception.ForBiddenException;
import com.crm.exception.NotFoundException;
import com.crm.model.ClientDetails;
import com.crm.model.Companys;
import com.crm.model.Employee;
import com.crm.model.ProjectGroupDetails;
import com.crm.model.ProjectParticipant;
import com.crm.model.Task;
import com.crm.model.dto.ResponseDTO;
import com.crm.repos.ClientDetailsRepository;
import com.crm.repos.CompanyRepository;
import com.crm.repos.EmployeeRepo;
import com.crm.repos.ProjectGroupRepository;
import com.crm.repos.ProjectParticipantRepository;
import com.crm.repos.TaskManagementRepository;
import com.crm.utility.Constants;
import com.crm.utility.JwtBasedCurrentUserProvider;
import com.crm.utility.RequestValidator;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.tomcat.util.bcel.Const;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
public class ProjectGroupService {

	@Autowired
	private ProjectGroupRepository projectGroupRepository;

	@Autowired
	private TaskManagementRepository taskRepository;

	@Autowired
	private EmployeeRepo employeeRepo;

	@Autowired
	private NotificationService notificationService;

	@Autowired
	private EmailService emailService;

	@Autowired
	private ProjectParticipantRepository participantRepository;

	@Autowired
	private ClientDetailsRepository clientDetailsRepository;
	
	@Autowired
	private CompanyRepository companyRepository;
	
	@Autowired
	private JwtBasedCurrentUserProvider basedCurrentUserProvider;

	private static final Logger LOGGER = LoggerFactory.getLogger(ProjectGroupService.class);

//	public ResponseEntity<ResponseDTO<Map<String, Object>>> createProjectGroup(Map<String, ?> request) {
//	    // Create project group entity and set basic details
//	    ProjectGroupDetails projectGroup = new ProjectGroupDetails();
//	    projectGroup.setProjectName((String) request.get(Constants.PROJECT_NAME));
//	    projectGroup.setProjectDesc((String) request.get(Constants.PROJECT_DESC));
//	    projectGroup.setCreatedById(Long.parseLong(request.get(Constants.CREATED_BY_ID).toString()));
//
//	    String defaultStatus = "open"; // Default status when creating the group
//	    projectGroup.setStatus(defaultStatus);
//
//	    // Get participant IDs from request
//	    List<Long> participantIds = ((List<?>) request.get(Constants.PARTICIPANTS)).stream()
//	            .map(p -> Long.parseLong(p.toString()))
//	            .collect(Collectors.toList());
//
//	    // Get client details
//	    Long clientId = Long.parseLong(request.get(Constants.CLIENT_ID).toString());
//	    ClientDetails client = clientDetailsRepository.findById(clientId)
//	            .orElseThrow(() -> new NotFoundException("Client with ID " + clientId + " not found"));
//	    projectGroup.setClient(client);
//
//	    // Validate and set multiple group leaders
//	    List<Long> groupLeaderIds = ((List<?>) request.get(Constants.GROUPLEADER_ID)).stream()
//	            .map(gl -> Long.parseLong(gl.toString()))
//	            .collect(Collectors.toList());
//
//	    // Ensure all group leaders are also part of the participants list
//	    if (!participantIds.containsAll(groupLeaderIds)) {
//	        throw new NotFoundException("All Group Leaders must be in the participants list");
//	    }
//
//	    // Fetch and validate group leaders (Using individual retrieval approach)
//	    List<Employee> groupLeaders = new ArrayList<>();
//	    for (Long groupLeaderId : groupLeaderIds) {
//	        Employee leader = employeeRepo.findById(groupLeaderId)
//	                .orElseThrow(() -> new NotFoundException("Group Leader with ID " + groupLeaderId + " not found"));
//	        groupLeaders.add(leader);
//	    }
//	    projectGroup.setGroupLeaders(groupLeaders);
//
//	    // Fetch and validate participants (Using individual retrieval approach)
//	    List<Employee> participants = new ArrayList<>();
//	    for (Long participantId : participantIds) {
//	        Employee employee = employeeRepo.findById(participantId)
//	                .orElseThrow(() -> new NotFoundException("Employee with ID " + participantId + " not found"));
//	        participants.add(employee);
//	    }
//	    projectGroup.setParticipants(participants);
//
//	    // Save project group
//	    projectGroup = projectGroupRepository.save(projectGroup);
//	    
//	    // Send notifications to participants
//	    for (Long participantId : participantIds) {
//	        Map<String, Object> notificationRequest = new HashMap<>();
//	        notificationRequest.put(Keys.ID, participantId);
//	        notificationRequest.put(Constants.FIELD_NOTIFICATION_TITLE, "Group Created: " + projectGroup.getProjectName());
//	        notificationRequest.put(Constants.FIELD_NOTIFICATION_TEXT, projectGroup.getProjectDesc());
//	        notificationService.createNotification(notificationRequest);
//	    }
//
//	    // Response
//	    Map<String, Object> responseAttributes = new HashMap<>();
//	    responseAttributes.put("Message", "Project Group created successfully");
//	    ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
//	    responseDTO.setAttributes(responseAttributes);
//
//	    return ResponseEntity.ok(responseDTO);
//	}

	@SuppressWarnings("unused")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> createProjectGroup(Map<String, ?> request) {
		
		Long companyId1=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		if(companyId1!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		
		ObjectMapper objectMapper = new ObjectMapper();
		 Long companyId = null;
		companyId = Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		
		Companys company = companyRepository.findByCompanyId(companyId)
	            .orElseThrow(() -> new NotFoundException("Company ID not found"));
		// Create project group entity and set basic details
		ProjectGroupDetails projectGroup = new ProjectGroupDetails();
		projectGroup.setProjectName((String) request.get(Constants.PROJECT_NAME));
		projectGroup.setProjectDesc((String) request.get(Constants.PROJECT_DESC));
		projectGroup.setCreatedById(Long.parseLong(request.get(Constants.CREATED_BY_ID).toString()));
		projectGroup.setStatus("open"); // Default status when creating the group
		projectGroup.setCompanyId(company.getCompanyId());
		// Fetch client details
		Long clientId = null;
		if (request.containsKey(Constants.CLIENT_ID) && request.get(Constants.CLIENT_ID) != null) {
			clientId = Long.parseLong(request.get(Constants.CLIENT_ID).toString());
		}

		if (clientId != null) {
			ClientDetails client = clientDetailsRepository.findById(clientId)
					.orElseThrow(() -> new NotFoundException("Client  ID not found"));
			projectGroup.setClient(client);
		} else {
			projectGroup.setClient(null);
		}

		// Save project group first to avoid transient entity issues
		ProjectGroupDetails savedProjectGroup = projectGroupRepository.save(projectGroup);

		// Fetch and validate group leaders
		List<Long> groupLeaderIds = ((List<?>) request.get(Constants.GROUPLEADER_ID)).stream()
				.map(gl -> Long.parseLong(gl.toString())).collect(Collectors.toList());
		List<Employee> groupLeaders = employeeRepo.findAllById(groupLeaderIds);

		// Parse participants (ID + role) from request
		 List<ProjectParticipant> projectParticipants = ((List<?>) request.get(Constants.PARTICIPANTS)).stream()
		            .map(participantData -> objectMapper.convertValue(participantData, ProjectParticipant.class))
		            .map(participant -> {
		                Employee employee = employeeRepo.findById(participant.getId())
		                        .orElseThrow(() -> new NotFoundException("Employee with ID " + participant.getId() + " not found"));

		                ProjectParticipant projectParticipant = new ProjectParticipant();
		                projectParticipant.setProjectGroup(savedProjectGroup);
		                projectParticipant.setEmployee(employee);
		                projectParticipant.setRole(participant.getRole());

		                return projectParticipant;
		            }).collect(Collectors.toList());

		// Ensure all group leaders are also participants
		for (Employee leader : groupLeaders) {
			boolean isParticipant = projectParticipants.stream()
					.anyMatch(pp -> Long.valueOf(pp.getEmployee().getId()).equals(leader.getId()));
			if (!isParticipant) {
				throw new NotFoundException("Group Leader " + leader.getId() + " must be in the participants list");
			}
		}

		// Associate group leaders & participants **before saving again**
		savedProjectGroup.setGroupLeaders(groupLeaders);
		savedProjectGroup.setParticipants(projectParticipants);

		// Save project group **only once** after setting all associations
		projectGroupRepository.save(savedProjectGroup);
		
		participantRepository.saveAll(projectParticipants);
		// No need to call `participantRepository.saveAll(projectParticipants);`

		// Send notifications to participants
		for (ProjectParticipant participant : projectParticipants) {
			Map<String, Object> notificationRequest = new HashMap<>();
			notificationRequest.put(Keys.ID, participant.getEmployee().getId());
			notificationRequest.put(Constants.FIELD_NOTIFICATION_TITLE,
					"Group Created: " + savedProjectGroup.getProjectName());
			notificationRequest.put(Constants.FIELD_NOTIFICATION_TEXT, savedProjectGroup.getProjectDesc());
			notificationService.createNotification(notificationRequest);
		}

		// Prepare response
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("Message", "Project Group created successfully");
		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> scheduleTask(Map<String, ?> request) {
		// Fetch project group
		Long projectGroupId = Long.parseLong(request.get(Constants.PROJECT_GROUPID).toString());
		ProjectGroupDetails projectGroup = projectGroupRepository.findById(projectGroupId)
				.orElseThrow(() -> new NotFoundException("Project Group not found"));
		Long requestCompanyId=projectGroup.getCompanyId();
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		if(requestCompanyId!=companyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		
		
		// Get task details
		@SuppressWarnings("unchecked")
		List<Map<String, ?>> taskList = (List<Map<String, ?>>) request.get("tasks");

		for (Map<String, ?> taskData : taskList) {
			new RequestValidator(taskData).hasString(Constants.FIELD_TASK_NAME).hasString(Constants.FIELD_DESCRIPTION)
					.hasEmail(Constants.FIELD_EMAIL, false).hasLong(Constants.FIELD_ASSIGNED_BY)
					.hasValidDateTime(Constants.FIELD_DEADLINE_TIMESTAMP).hasValidParticipantIds("assignedEmployees")
					.hasValidPriority(Constants.PRIORITY);
			Task task = new Task();
			task.setTaskName((String) taskData.get(Constants.FIELD_TASK_NAME));
			task.setDescription((String) taskData.get(Constants.FIELD_DESCRIPTION));
			task.setAssignedTimestamp(LocalDateTime.now());
			task.setDeadlineTimestamp(LocalDateTime.parse((String) taskData.get(Constants.FIELD_DEADLINE_TIMESTAMP)));
			task.setStatus("pending");
			task.setCompanyId(requestCompanyId);
			task.setPriority((String)taskData.get(Constants.PRIORITY));

			// Validate assignedBy (Must be Group Leader)
			Long assignedById = Long.parseLong(taskData.get(Constants.FIELD_ASSIGNED_BY).toString());

			boolean isGroupLeader = projectGroup.getGroupLeaders().stream()
					.anyMatch(leader -> Long.valueOf(leader.getId()).equals(assignedById));

			@SuppressWarnings("deprecation")
			Employee emp = employeeRepo.getById(assignedById);

			boolean hasPermission = isGroupLeader || emp.getRole() == 1;

			if (!hasPermission) {
				throw new ForBiddenException("Only a Group Leader or an Employee with role admin can assign tasks");
			}
			task.setAssignedBy(assignedById);

			task.setEmail((String) taskData.get(Constants.FIELD_EMAIL));
			task.setProjectGroup(projectGroup);

			// Get assigned employee IDs
			@SuppressWarnings("unchecked")
			List<Integer> assignedEmployeeIds = (List<Integer>) taskData.get("assignedEmployees");
			List<Employee> assignedEmployees = new ArrayList<>();

			// Validate assigned employees (Must be part of project participants)
			for (Integer assignedEmployeeId : assignedEmployeeIds) {
				ProjectParticipant participant = projectGroup.getParticipants().stream()
						.filter(p -> Long.valueOf(p.getEmployee().getId()).equals(Long.valueOf(assignedEmployeeId)))
						.findFirst().orElseThrow(() -> new NotFoundException(
								"Employee with ID " + assignedEmployeeId + " is not a project participant"));

				assignedEmployees.add(participant.getEmployee());

				// Send notification to the assigned participant
				Map<String, Object> notificationRequest = new HashMap<>();
				notificationRequest.put(Keys.ID, assignedEmployeeId);
				notificationRequest.put(Constants.FIELD_NOTIFICATION_TITLE, "New Task Assigned: " + task.getTaskName());
				notificationRequest.put(Constants.FIELD_NOTIFICATION_TEXT,
						"You have been assigned a new task: " + task.getTaskName() + " - " + task.getDescription());
				notificationService.createNotification(notificationRequest);
			}

			task.setAssignedEmployees(assignedEmployees);
			taskRepository.save(task);
		}

		// Response
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("Message", "Tasks scheduled successfully");
		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	public void updateTaskStatus(Map<String, ?> request) {

		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		
		if(companyId!=requestCompanyId) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		
		Long employeeId = Long.parseLong(request.get("employee_id").toString());
		Long taskId = Long.parseLong(request.get("taskId").toString());

		Task task = taskRepository.findById(taskId).orElseThrow(() -> new NotFoundException("Task not found"));

		if (!task.getAssignedEmployees().stream().anyMatch(e -> Long.valueOf(e.getId()).equals(employeeId))) {
			throw new ForBiddenException("You are not assigned to this task");
		}

		ProjectGroupDetails projectGroup = task.getProjectGroup();
		List<Task> tasks = projectGroup.getScheduleTask();

		int currentTaskIndex = tasks.indexOf(task);

		// Ensure the first task is completed before allowing updates to any other task
		if (currentTaskIndex > 0) { // If the current task is not the first one
			Task previousTask = tasks.get(currentTaskIndex - 1);
			if (previousTask.getStatus() == null || !"closed".equalsIgnoreCase(previousTask.getStatus())) {
				throw new ForBiddenException("The previous task must be completed before updating this task.");
			}
		}

		String status = (String) request.get("status");
		task.setStatus(status);
		task.setCompletionTime(LocalDateTime.now());
		taskRepository.save(task);

		int next = currentTaskIndex + 1;

		// Ensure there is a next task before updating its status
		if (next < tasks.size()) {
			Task nextTask = tasks.get(next);
			nextTask.setStatus("open"); // Only change the next task's status
			taskRepository.save(nextTask);
			// Notify next task's assigned employees

//	        for (Employee assignedEmployee : nextTask.getAssignedEmployees()) {
//	            String message = "Task '" + task.getTaskName() + "' has been completed by Employee ID: " + employeeId 
//	                + ". Your task has now been opened.";
//
//	            Map<String, Object> notificationRequest = Map.of(
//	                    Keys.ID, assignedEmployee.getId(),
//	                    Constants.FIELD_NOTIFICATION_TITLE, "Task Update",
//	                    Constants.FIELD_NOTIFICATION_TEXT, message
//	            );
//
//	            notificationService.createNotification(notificationRequest);
//	            emailService.sendEmail(assignedEmployee.getEmail(), "Task Assignment Update", message);
//	        }
		}

		boolean deadlineAdjusted = false;

		// Adjust deadlines for subsequent tasks if the task was completed early
		if (task.getCompletionTime().isBefore(task.getDeadlineTimestamp())) {
			long daysSaved = ChronoUnit.DAYS.between(task.getCompletionTime(), task.getDeadlineTimestamp());

			// Adjust the deadlines for all subsequent tasks (starting from the next task)
			for (int i = currentTaskIndex + 1; i < tasks.size(); i++) {
				Task nextTask = tasks.get(i);

				// Adjust the deadline by subtracting the days saved
				nextTask.setDeadlineTimestamp(nextTask.getDeadlineTimestamp().minusDays(daysSaved));

				// Save the updated task with the new deadline
				taskRepository.save(nextTask);

				// Notify next task's assigned employees
				for (Employee assignedEmployee : nextTask.getAssignedEmployees()) {
					final String message = "Task '" + task.getTaskName() + "' has been completed by Employee ID: "
							+ employeeId + ". The deadline for your task has been adjusted." + ". New deadline: "
							+ nextTask.getDeadlineTimestamp();

					Map<String, Object> notificationRequest = Map.of(Keys.ID, assignedEmployee.getId(),
							Constants.FIELD_NOTIFICATION_TITLE, "Task Update", Constants.FIELD_NOTIFICATION_TEXT,
							message);

					notificationService.createNotification(notificationRequest);
					CompletableFuture.runAsync(() -> emailService.sendEmail(assignedEmployee.getEmail(),
							"Task Assignment Update", message));

				}

			}

			deadlineAdjusted = true; // Mark that the deadline has been adjusted
		}

		// If the deadline was not adjusted (completed on time), still notify employees
		if (!deadlineAdjusted) {

			for (int i = currentTaskIndex + 1; i < tasks.size(); i++) {
				Task nextTask = tasks.get(i);

				// Notify next task's assigned employees (even if deadline is not changed)
				for (Employee assignedEmployee : nextTask.getAssignedEmployees()) {
					String message = "Task '" + task.getTaskName() + "' has been completed by Employee ID: "
							+ employeeId + ". The task has been completed on time.";

					Map<String, Object> notificationRequest = Map.of(Keys.ID, assignedEmployee.getId(),
							Constants.FIELD_NOTIFICATION_TITLE, "Task Update", Constants.FIELD_NOTIFICATION_TEXT,
							message);
					notificationService.createNotification(notificationRequest);

					emailService.sendEmail(assignedEmployee.getEmail(), "Task Assignment Update", message);
				}

			}

		}

	}

	public void deleteProjectGroup(Long projectGroupId,Map<String,?>request) {
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		
		if(companyId!=requestCompanyId) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		// Fetch project group details
		ProjectGroupDetails projectGroup = projectGroupRepository.findById(projectGroupId)
				.orElseThrow(() -> new NotFoundException("Project group not found"));

		// Delete associated tasks first
		List<Task> tasks = taskRepository.findByProjectGroup(projectGroup);
//		for (Task task : tasks) {
//			if (!"closed".equalsIgnoreCase(task.getStatus())) {
//				throw new ForBiddenException("All tasks must be closed before deleting the project group.");
//			}
//		}
		taskRepository.deleteAll(tasks);

		ClientDetails client = projectGroup.getClient();
		if (client != null) {
			client.getProjects().remove(projectGroup);
			clientDetailsRepository.save(client); // Update the client entity in the DB
		}

		// Delete the project group
		projectGroupRepository.delete(projectGroup);
	}

	public void deleteTask(Long projectGroupId, Long taskId,Map<String,?>request) {
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		
		if(companyId!=requestCompanyId) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		// Fetch project group details
		ProjectGroupDetails projectGroup = projectGroupRepository.findById(projectGroupId)
				.orElseThrow(() -> new NotFoundException("Project group not found"));

		// Fetch task details
		Task task = taskRepository.findById(taskId).orElseThrow(() -> new NotFoundException("Task not found"));

		// Check if the task belongs to the project group
		if (!task.getProjectGroup().getProjectId().equals(projectGroupId)) {
			throw new ForBiddenException("Task does not belong to the specified project group");
		}

		// Check if the task is completed
		if ("closed".equalsIgnoreCase(task.getStatus())) {
			throw new ForBiddenException("Cannot delete a completed task.");
		}

		// Delete the task
		taskRepository.delete(task);

		projectGroup.getScheduleTask().remove(task);
		projectGroupRepository.save(projectGroup);
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllProjects(Integer pageNum, Integer pageSize,Map<String,?>request) {
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		
		if(companyId!=requestCompanyId) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		
		Pageable pageable = PageRequest.of(pageNum - 1, pageSize, Sort.by(Sort.Order.desc("createdAt")));
		Page<ProjectGroupDetails> projectsPage = projectGroupRepository.findByCompanyId(requestCompanyId,pageable);

		List<Map<String, Object>> responseProjects = projectsPage.getContent().stream().map(project -> {
			Map<String, Object> projectData = new HashMap<>();
			projectData.put("projectGroupId", project.getProjectId());
			projectData.put("projectName", project.getProjectName());
			projectData.put("createdById", project.getCreatedById());
			projectData.put("createdAt", project.getCreatedAt());
			projectData.put("projectDesc", project.getProjectDesc());
			projectData.put(Constants.COMPANY_ID, project.getCompanyId());
			
//		ClientDetails clientDetails=project.getClient();
//		projectData.put(Constants.CLIENT_ID, clientDetails.getClientId());
			// Extracting participant details
	        List<Map<String, Object>> participantDetails = project.getParticipants().stream().map(participant -> {
	            Map<String, Object> participantData = new HashMap<>();
	            Employee emp = participant.getEmployee();
	            participantData.put("id", String.valueOf(emp.getId()));
	            participantData.put("name", emp.getName());
	            participantData.put("role", participant.getRole());
	            participantData.put("phone", emp.getMobile());
	            return participantData;
	        }).collect(Collectors.toList());

	        projectData.put("participants", participantDetails);
			
			// Extracting group leader IDs
		    List<Long> groupLeaderIds = project.getGroupLeaders().stream()
		            .map(Employee::getId)
		            .collect(Collectors.toList());
		    projectData.put("groupLeaderIds", groupLeaderIds);
			projectData.put("status", project.getStatus());
			return projectData;
		}).collect(Collectors.toList());

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("projects", responseProjects);
		responseAttributes.put("totalProjects", projectsPage.getTotalElements());
		responseAttributes.put("totalPages", projectsPage.getTotalPages());
		responseAttributes.put("currentPage", projectsPage.getNumber() + 1);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> getProjectById(Map<String, ?> entity) {
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(entity.get(Constants.COMPANY_ID).toString());
		
		if(companyId!=requestCompanyId) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}

		Long projectId = Long.parseLong(entity.get(Constants.PROJECT_GROUPID).toString());
		
		// Fetching the project details
		ProjectGroupDetails project = projectGroupRepository.findById(projectId)
				.orElseThrow(() -> new NotFoundException("Project with ID " + projectId + " not found."));
		
		if(project.getCompanyId()!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		// Get all tasks related to this project
		List<Task> tasks = taskRepository.findByProjectGroup(project);

		// Map tasks to a list of task details
		List<Map<String, Object>> responseTasks = tasks.stream().map(task -> {
			Map<String, Object> taskData = new HashMap<>();
			taskData.put("taskId", task.getId());
			taskData.put("taskName", task.getTaskName());
			List<Long> assignedEmployeeIds = task.getAssignedEmployees().stream().map(employee -> employee.getId()) // Get
																													// employee
																													// ID
					.collect(Collectors.toList());
			taskData.put("assignedEmployees", assignedEmployeeIds);
			taskData.put("assignedBy", task.getAssignedBy());
			taskData.put("description", task.getDescription());
			taskData.put("deadlineTimestamp", task.getDeadlineTimestamp());
			taskData.put("status", task.getStatus());
			taskData.put("priority", task.getPriority());
			taskData.put(Constants.FIELD_ASSIGNED_TIMESTAMP, task.getAssignedTimestamp());
			return taskData;
		}).collect(Collectors.toList());
		
		  // Extracting participant details
	    List<Map<String, Object>> participantDetails = project.getParticipants().stream().map(participant -> {
	        Map<String, Object> participantData = new HashMap<>();
	        Employee emp = participant.getEmployee();
	        participantData.put("id", String.valueOf(emp.getId()));
	        participantData.put("name", emp.getName());
	        participantData.put("role", participant.getRole());
	        participantData.put("phone", emp.getMobile());
	        return participantData;
	    }).collect(Collectors.toList());
		

	    // Extracting group leader IDs
	    List<Long> groupLeaderIds = project.getGroupLeaders().stream()
	            .map(Employee::getId)
	            .collect(Collectors.toList());
		// Preparing the response with project details and related tasks
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("projectGroupId", project.getProjectId());
		responseAttributes.put("projectName", project.getProjectName());
		responseAttributes.put("createdById", project.getCreatedById());
		responseAttributes.put("projectDesc", project.getProjectDesc());
		responseAttributes.put("createdAt", project.getCreatedAt());
		responseAttributes.put("groupLeaderIds", groupLeaderIds);
		responseAttributes.put("participants", participantDetails);
		responseAttributes.put("status", project.getStatus());
		responseAttributes.put("tasks", responseTasks);
		responseAttributes.put(Constants.COMPANY_ID, project.getCompanyId());
//		ClientDetails clientDetails=project.getClient();
//		responseAttributes.put(Constants.CLIENT_ID, clientDetails.getClientId());
		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> getTasksByProjectId(Map<String, ?> entity, Integer pageNum,
			Integer pageSize) {
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(entity.get(Constants.COMPANY_ID).toString());
		
		if(companyId!=requestCompanyId) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		
		Long projectId = Long.parseLong(entity.get(Constants.PROJECT_GROUPID).toString());

		
		// Check if project exists
		ProjectGroupDetails project = projectGroupRepository.findById(projectId)
				.orElseThrow(() -> new NotFoundException("Project with ID " + projectId + " not found."));

		if(project.getCompanyId()!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		// Pagination setup
		Pageable pageable = PageRequest.of(pageNum - 1, pageSize, Sort.by(Sort.Order.desc("deadlineTimestamp")));
		Page<Task> tasksPage = taskRepository.findByProjectGroup_ProjectId(projectId, pageable);

		// Transform tasks into response format
		List<Map<String, Object>> responseTasks = tasksPage.getContent().stream().map(task -> {
			Map<String, Object> taskData = new HashMap<>();
			taskData.put("taskId", task.getId());
			taskData.put("taskName", task.getTaskName());
			taskData.put("status", task.getStatus());
			taskData.put("deadlineTimestamp", task.getDeadlineTimestamp());
			taskData.put("description", task.getDescription());
			taskData.put("assignedBy", task.getAssignedBy());
			taskData.put("priority", task.getPriority());
			taskData.put(Constants.FIELD_ASSIGNED_TIMESTAMP, task.getAssignedTimestamp());
			// Extracting only employee IDs from assigned employees
			List<Long> assignedEmployeeIds = task.getAssignedEmployees().stream().map(Employee::getId) // Only get
																										// employee ID
					.collect(Collectors.toList());
			taskData.put("assignedEmployees", assignedEmployeeIds);

			return taskData;
		}).collect(Collectors.toList());

		// Preparing response with pagination
		Map<String, Object> responseAttributes = new HashMap<>();

		responseAttributes.put("tasks", responseTasks);
		responseAttributes.put("totalTasks", tasksPage.getTotalElements());
		responseAttributes.put("totalPages", tasksPage.getTotalPages());
		responseAttributes.put("currentPage", tasksPage.getNumber() + 1);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> getTasksByEmployeeAndProject(Long employeeId,
			Long projectId,Map<String,?>request) {
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		
		if(companyId!=requestCompanyId) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		// Check if the project exists
		ProjectGroupDetails project = projectGroupRepository.findById(projectId)
				.orElseThrow(() -> new NotFoundException("Project with ID " + projectId + " not found."));

		if(project.getCompanyId()!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		// Check if the employee is part of the project group
		boolean isEmployeePartOfProject = project.getParticipants().stream()
				.anyMatch(employee -> Long.valueOf(employee.getEmployee().getId()).equals(employeeId));

		if (!isEmployeePartOfProject) {
			throw new NotFoundException("Employee with ID " + employeeId + " is not a participant of the project.");
		}

		// Fetch tasks assigned to the employee in the project
		List<Task> tasks = taskRepository.findByProjectGroup_ProjectIdAndAssignedEmployees_Id(projectId, employeeId);

		if (tasks.isEmpty()) {
			Map<String, Object> responseAttributes = new HashMap<>();
			responseAttributes.put("message", "You are not assigned any task.");

			ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
			responseDTO.setAttributes(responseAttributes);

			return ResponseEntity.ok(responseDTO);
		}

		// Transform tasks into response format
		List<Map<String, Object>> responseTasks = tasks.stream().map(task -> {
			Map<String, Object> taskData = new HashMap<>();
			taskData.put("taskId", task.getId());
			taskData.put("taskName", task.getTaskName());
			taskData.put("status", task.getStatus());
			taskData.put("deadlineTimestamp", task.getDeadlineTimestamp());
			taskData.put("description", task.getDescription());
			taskData.put("assignedBy", task.getAssignedBy());
			taskData.put("priority", task.getPriority());
			taskData.put(Constants.FIELD_ASSIGNED_TIMESTAMP, task.getAssignedTimestamp());
			
			// Extract only employee IDs from assigned employees
			List<Long> assignedEmployeeIds = task.getAssignedEmployees().stream().map(Employee::getId) // Only get
																										// employee ID
					.collect(Collectors.toList());
			taskData.put("assignedEmployeeId", assignedEmployeeIds);

			return taskData;
		}).collect(Collectors.toList());

		// Preparing response
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("tasks", responseTasks);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

//	public ResponseEntity<ResponseDTO<Map<String, Object>>> assignTaskToParticipant(Map<String, ?> request) {
//		// Fetch project group
//		Long projectGroupId = Long.parseLong(request.get(Constants.PROJECT_GROUPID).toString());
//		ProjectGroupDetails projectGroup = projectGroupRepository.findById(projectGroupId)
//				.orElseThrow(() -> new NotFoundException("Project Group not found"));
//
//		// Get task details
//		@SuppressWarnings("unchecked")
//		List<Map<String, Object>> taskList = (List<Map<String, Object>>) request.get("tasks");
//
//		for (Map<String, Object> taskData : taskList) {
//			Task task = new Task();
//			task.setTaskName((String) taskData.get("taskName"));
//			task.setDescription((String) taskData.get("description"));
//			task.setAssignedTimestamp(LocalDateTime.now());
//			task.setDeadlineTimestamp(LocalDateTime.parse((String) taskData.get("deadlineTimestamp")));
//			task.setStatus("open");
//
//			// Get the ID of the person assigning the task (assignedBy)
//			Long assignedById = Long.parseLong(taskData.get("assignedBy").toString());
//
//			// Validate that the assignee (assignedBy) is part of the project group
//			boolean isValidParticipant = projectGroup.getParticipants().stream()
//					.anyMatch(participant -> Long.valueOf(participant.getId()).equals(assignedById));
//
//			if (!isValidParticipant) {
//				throw new ForBiddenException("Only a valid participant can assign tasks to themselves");
//			}
//
//			// Set assignedBy to the valid participant
//			task.setAssignedBy(assignedById);
//
//			task.setEmail((String) taskData.get("email"));
//			task.setProjectGroup(projectGroup);
//
//			// Get assigned employee IDs (assignedEmployees) - these should be the same as
//			// assignedBy for self-assignment
//			@SuppressWarnings("unchecked")
//			List<Integer> assignedEmployeeIds = (List<Integer>) taskData.get("assignedEmployees");
//			List<Long> longAssignedEmployeeIds = assignedEmployeeIds.stream().map(Integer::longValue) // Convert Integer
//																										// to Long
//					.collect(Collectors.toList());
//
//			// Ensure the employee is assigning the task to themselves
//			if (longAssignedEmployeeIds.size() != 1 || !longAssignedEmployeeIds.get(0).equals(assignedById)) {
//				throw new ForBiddenException("The task can only be assigned to the participant themselves");
//			}
//
//			List<Employee> assignedEmployees = new ArrayList<>();
//
//			// Validate that the assigned employees are part of the project group
//			for (Long assignedEmployeeId : longAssignedEmployeeIds) {
//				Employee employee = projectGroup.getParticipants().stream()
//						.filter(e -> Long.valueOf(e.getId()).equals(assignedEmployeeId)).findFirst()
//						.orElseThrow(() -> new NotFoundException(
//								"Employee with ID " + assignedEmployeeId + " is not a participant"));
//				assignedEmployees.add(employee);
//			}
//
//			task.setAssignedEmployees(assignedEmployees);
//			taskRepository.save(task);
//
//			// Add task to the schedule
//			projectGroup.getScheduleTask().add(task);
//		}
//
//		// Save the project group with the updated schedule
//		projectGroupRepository.save(projectGroup);
//
//		// Response
//		Map<String, Object> responseAttributes = new HashMap<>();
//		responseAttributes.put("Message", "Tasks assigned successfully and added to schedule");
//		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
//		responseDTO.setAttributes(responseAttributes);
//
//		return ResponseEntity.ok(responseDTO);
//	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> markProjectStatus(Long projectId, String newStatus,Map<String,?>entity) {
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(entity.get(Constants.COMPANY_ID).toString());
		
		if(companyId!=requestCompanyId) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		// Check if the project exists
		ProjectGroupDetails project = projectGroupRepository.findById(projectId)
				.orElseThrow(() -> new NotFoundException("Project with ID " + projectId + " not found."));

		if(project.getCompanyId()!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		// If the new status is 'closed', we need to check if all tasks are closed
		if ("closed".equalsIgnoreCase(newStatus)) {
			// Fetch all tasks related to the project
			List<Task> tasks = taskRepository.findByProjectGroup_ProjectId(projectId);

			// Check if all tasks are closed
			boolean allTasksClosed = tasks.stream().allMatch(task -> "closed".equalsIgnoreCase(task.getStatus()));

			if (!allTasksClosed) {
				Map<String, Object> responseAttributes = new HashMap<>();
				responseAttributes.put("message", "Complete all tasks before closing the project.");

				ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
				responseDTO.setAttributes(responseAttributes);

				return ResponseEntity.ok(responseDTO);
			}
		}

		// Update the project status to the new status
		project.setStatus(newStatus);
		projectGroupRepository.save(project);

		// Prepare a successful response
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Project status updated to " + newStatus);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

}
