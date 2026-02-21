package com.crm.service;

import com.crm.controller.BillController;
import com.crm.controller.Keys;
import com.crm.exception.ForBiddenException;
import com.crm.exception.NotFoundException;
import com.crm.model.ClientDetails;
import com.crm.model.Employee;
import com.crm.model.ProjectGroupDetails;
import com.crm.model.ProjectParticipant;
import com.crm.model.Task;
import com.crm.model.dto.ResponseDTO;
import com.crm.repos.ClientDetailsRepository;
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
import com.crm.model.dto.project.CreateProjectRequest;
import com.crm.model.dto.project.ProjectDTO;
import com.crm.model.dto.project.ProjectParticipantDTO;
import com.crm.model.dto.project.UpdateTaskStatusRequest;
import com.crm.model.dto.project.CreateTaskRequest;
import com.crm.model.dto.project.AddParticipantRequest;
import com.crm.model.dto.TokenInfo;
import com.crm.model.dto.project.TaskDTO;
import org.springframework.security.core.context.SecurityContextHolder;
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
	private JwtBasedCurrentUserProvider basedCurrentUserProvider;

	@Autowired
	private ObjectMapper objectMapper;

	private static final Logger LOGGER = LoggerFactory.getLogger(ProjectGroupService.class);

	// public ResponseEntity<ResponseDTO<Map<String, Object>>>
	// createProjectGroup(Map<String, ?> request) {
	// // Create project group entity and set basic details
	// ProjectGroupDetails projectGroup = new ProjectGroupDetails();
	// projectGroup.setProjectName((String) request.get(Constants.PROJECT_NAME));
	// projectGroup.setProjectDesc((String) request.get(Constants.PROJECT_DESC));
	// projectGroup.setCreatedById(Long.parseLong(request.get(Constants.CREATED_BY_ID).toString()));
	//
	// String defaultStatus = "open"; // Default status when creating the group
	// projectGroup.setStatus(defaultStatus);
	//
	// // Get participant IDs from request
	// List<Long> participantIds = ((List<?>)
	// request.get(Constants.PARTICIPANTS)).stream()
	// .map(p -> Long.parseLong(p.toString()))
	// .collect(Collectors.toList());
	//
	// // Get client details
	// Long clientId = Long.parseLong(request.get(Constants.CLIENT_ID).toString());
	// ClientDetails client = clientDetailsRepository.findById(clientId)
	// .orElseThrow(() -> new NotFoundException("Client with ID " + clientId + " not
	// found"));
	// projectGroup.setClient(client);
	//
	// // Validate and set multiple group leaders
	// List<Long> groupLeaderIds = ((List<?>)
	// request.get(Constants.GROUPLEADER_ID)).stream()
	// .map(gl -> Long.parseLong(gl.toString()))
	// .collect(Collectors.toList());
	//
	// // Ensure all group leaders are also part of the participants list
	// if (!participantIds.containsAll(groupLeaderIds)) {
	// throw new NotFoundException("All Group Leaders must be in the participants
	// list");
	// }
	//
	// // Fetch and validate group leaders (Using individual retrieval approach)
	// List<Employee> groupLeaders = new ArrayList<>();
	// for (Long groupLeaderId : groupLeaderIds) {
	// Employee leader = employeeRepo.findById(groupLeaderId)
	// .orElseThrow(() -> new NotFoundException("Group Leader with ID " +
	// groupLeaderId + " not found"));
	// groupLeaders.add(leader);
	// }
	// projectGroup.setGroupLeaders(groupLeaders);
	//
	// // Fetch and validate participants (Using individual retrieval approach)
	// List<Employee> participants = new ArrayList<>();
	// for (Long participantId : participantIds) {
	// Employee employee = employeeRepo.findById(participantId)
	// .orElseThrow(() -> new NotFoundException("Employee with ID " + participantId
	// + " not found"));
	// participants.add(employee);
	// }
	// projectGroup.setParticipants(participants);
	//
	// // Save project group
	// projectGroup = projectGroupRepository.save(projectGroup);
	//
	// // Send notifications to participants
	// for (Long participantId : participantIds) {
	// Map<String, Object> notificationRequest = new HashMap<>();
	// notificationRequest.put(Keys.ID, participantId);
	// notificationRequest.put(Constants.FIELD_NOTIFICATION_TITLE, "Group Created: "
	// + projectGroup.getProjectName());
	// notificationRequest.put(Constants.FIELD_NOTIFICATION_TEXT,
	// projectGroup.getProjectDesc());
	// notificationService.createNotification(notificationRequest);
	// }
	//
	// // Response
	// Map<String, Object> responseAttributes = new HashMap<>();
	// responseAttributes.put("Message", "Project Group created successfully");
	// ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
	// responseDTO.setAttributes(responseAttributes);
	//
	// return ResponseEntity.ok(responseDTO);
	// }

	public ProjectDTO createProject(CreateProjectRequest request) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		System.out.print("TOKEN INFO: " + tokenInfo.toString());
		Long companyId = tokenInfo.getCompanyId();

		ProjectGroupDetails project = new ProjectGroupDetails();
		project.setProjectName(request.getProjectName());
		project.setProjectDesc(request.getProjectDesc());
		project.setCreatedById(request.getCreatedById());
		project.setStatus("open");
		project.setCompanyId(companyId);

		if (request.getClientId() != null) {
			ClientDetails client = clientDetailsRepository.findById(request.getClientId())
					.orElseThrow(() -> new NotFoundException("Client not found"));
			project.setClient(client);
		}

		ProjectGroupDetails savedProject = projectGroupRepository.save(project);

		List<Employee> groupLeaders = employeeRepo.findAllById(request.getGroupLeaderIds());
		if (groupLeaders.size() != request.getGroupLeaderIds().size()) {
			throw new NotFoundException("Some group leaders not found");
		}

		List<ProjectParticipant> participants = request.getParticipants().stream().map(pRequest -> {
			Employee employee = employeeRepo.findById(pRequest.getId())
					.orElseThrow(() -> new NotFoundException("Employee " + pRequest.getId() + " not found"));

			ProjectParticipant participant = new ProjectParticipant();
			participant.setProjectGroup(savedProject);
			participant.setEmployee(employee);
			participant.setRole(pRequest.getRole());
			return participant;
		}).collect(Collectors.toList());

		// Validate leaders are participants
		for (Employee leader : groupLeaders) {
			boolean isParticipant = participants.stream()
					.anyMatch(p -> p.getEmployee().getId() == leader.getId());
			if (!isParticipant) {
				throw new com.crm.exception.BadRequestException(
						"Group Leader " + leader.getName() + " must be a participant");
			}
		}

		savedProject.setGroupLeaders(groupLeaders);
		savedProject.setParticipants(participants);

		projectGroupRepository.save(savedProject);
		participantRepository.saveAll(participants); // Explicit save might be needed if cascade not set

		// Notifications
		participants.forEach(p -> {
			Map<String, Object> notificationRequest = new HashMap<>();
			notificationRequest.put(Keys.ID, p.getEmployee().getId());
			notificationRequest.put(Constants.FIELD_NOTIFICATION_TITLE,
					"Group Created: " + savedProject.getProjectName());
			notificationRequest.put(Constants.FIELD_NOTIFICATION_TEXT, savedProject.getProjectDesc());
			try {
				notificationService.createNotification(notificationRequest);
			} catch (Exception e) {
				LOGGER.error("Failed to send notification", e);
			}
		});

		return mapToProjectDTO(savedProject);
	}

	private ProjectDTO mapToProjectDTO(ProjectGroupDetails project) {
		ProjectDTO dto = new ProjectDTO();
		dto.setId(project.getProjectId());
		dto.setName(project.getProjectName());
		dto.setDescription(project.getProjectDesc());
		dto.setStatus(project.getStatus());
		dto.setCompanyId(project.getCompanyId());
		dto.setCreatedBy(project.getCreatedById());
		dto.setCreatedAt(project.getCreatedAt());

		if (project.getClient() != null) {
			dto.setClientId(project.getClient().getClientId());
			dto.setClientName(project.getClient().getName());
		}

		dto.setGroupLeaderIds(project.getGroupLeaders().stream().map(Employee::getId).collect(Collectors.toList()));

		dto.setParticipants(project.getParticipants().stream().map(p -> {
			ProjectParticipantDTO pDto = new ProjectParticipantDTO();
			pDto.setId(p.getEmployee().getId());
			pDto.setName(p.getEmployee().getName());
			pDto.setRole(p.getRole());
			pDto.setMobile(p.getEmployee().getMobile());
			pDto.setEmail(p.getEmployee().getEmail());
			return pDto;
		}).collect(Collectors.toList()));

		return dto;
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> scheduleTask(Map<String, ?> request) {
		// Fetch project group
		Long projectGroupId = Long.parseLong(request.get(Constants.PROJECT_GROUPID).toString());
		ProjectGroupDetails projectGroup = projectGroupRepository.findById(projectGroupId)
				.orElseThrow(() -> new NotFoundException("Project Group not found"));
		Long requestCompanyId = projectGroup.getCompanyId();
		Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
		if (requestCompanyId != companyId) {
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
			task.setPriority((String) taskData.get(Constants.PRIORITY));

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

	public void updateTaskStatus(UpdateTaskStatusRequest request) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Long companyId = tokenInfo.getCompanyId();
		Long userId = tokenInfo.getUserId();
		Long userRole = tokenInfo.getRole(); // 1: ADMIN, 2: EXECUTIVE, 3: EMPLOYEE, 4: CLIENT

		Task task = taskRepository.findById(request.getTaskId())
				.orElseThrow(() -> new NotFoundException("Task not found"));

		if (!task.getCompanyId().equals(companyId)) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}

		// Check permissions: Assigned, Creator, Group Leader, OR ADMIN/EXECUTIVE
		boolean isAssigned = task.getAssignedEmployees().stream()
				.anyMatch(e -> e.getId() == userId);
		boolean isCreator = task.getProjectGroup().getCreatedById().equals(userId);
		boolean isLeader = task.getProjectGroup().getGroupLeaders().stream()
				.anyMatch(e -> e.getId() == userId);
		boolean isAdminOrExecutive = (userRole.intValue() == 1 || userRole.intValue() == 2);

		if (!isAssigned && !isCreator && !isLeader && !isAdminOrExecutive) {
			throw new ForBiddenException("You are not authorized to update this task");
		}

		String status = request.getStatus();
		task.setStatus(status);

		if ("closed".equalsIgnoreCase(status)) {
			task.setCompletionTime(LocalDateTime.now());
		} else {
			task.setCompletionTime(null);
		}

		taskRepository.save(task);
	}

	public void deleteProjectGroup(Long projectGroupId) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Long companyId = tokenInfo.getCompanyId();
		Long userId = tokenInfo.getUserId();

		ProjectGroupDetails projectGroup = projectGroupRepository.findById(projectGroupId)
				.orElseThrow(() -> new NotFoundException("Project group not found"));

		if (!projectGroup.getCompanyId().equals(companyId)) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}

		// Only creator or Admin can delete? Existing logic:
		// Long employeeId = Long.parseLong(request.get("employee_id").toString());
		// if (!projectGroup.getCreatedById().equals(employeeId)) { throw ... }

		// New Logic: Check if User is Creator OR Admin/Executive
		boolean isCreator = projectGroup.getCreatedById().equals(userId);
		Long userRole = tokenInfo.getRole();
		boolean isAdminOrExecutive = (userRole != null && (userRole == 1 || userRole == 2)); // 1=Admin, 2=Executive

		if (!isCreator && !isAdminOrExecutive) {
			throw new ForBiddenException("You are not authorized to delete this project group");
		}

		// Delete associated tasks first
		List<Task> tasks = taskRepository.findByProjectGroup(projectGroup);
		// for (Task task : tasks) {
		// if (!"closed".equalsIgnoreCase(task.getStatus())) {
		// throw new ForBiddenException("All tasks must be closed before deleting the
		// project group.");
		// }
		// }
		taskRepository.deleteAll(tasks);

		ClientDetails client = projectGroup.getClient();
		if (client != null) {
			client.getProjects().remove(projectGroup);
			clientDetailsRepository.save(client); // Update the client entity in the DB
		}

		// Delete the project group
		projectGroupRepository.delete(projectGroup);
	}

	public void deleteTask(Long taskId) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Long companyId = tokenInfo.getCompanyId();
		Long userId = tokenInfo.getUserId();
		Long userRole = tokenInfo.getRole();

		Task task = taskRepository.findById(taskId).orElseThrow(() -> new NotFoundException("Task not found"));
		ProjectGroupDetails projectGroup = task.getProjectGroup();

		if (!task.getCompanyId().equals(companyId)) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}

		// Permissions: Creator, Leader, Admin/Executive, OR Assigned User?
		// Typically, deletion is restricted to Admins/Leaders/Creators.
		boolean isCreator = projectGroup.getCreatedById().equals(userId);
		boolean isLeader = projectGroup.getGroupLeaders().stream()
				.anyMatch(e -> e.getId() == userId);
		boolean isAdminOrExecutive = (userRole != null && (userRole == 1 || userRole == 2));

		// Also allow the user who ASSIGNED the task if that's tracked
		// (task.getAssignedBy())
		boolean isAssigner = task.getAssignedBy() != null && task.getAssignedBy().equals(userId);

		if (!isCreator && !isLeader && !isAdminOrExecutive && !isAssigner) {
			throw new ForBiddenException("You are not authorized to delete this task");
		}

		// Check if the task is completed
		if ("closed".equalsIgnoreCase(task.getStatus())) {
			throw new ForBiddenException("Cannot delete a completed task.");
		}

		// Delete the task
		taskRepository.delete(task);

		// Optional: Remove from project list explicitly if bidirectional relationship
		// management is needed,
		// but JPA/Hibernate usually handles this if mapped correctly or we modify the
		// list and save project.
		// The original code did: projectGroup.getScheduleTask().remove(task);
		// projectGroupRepository.save(projectGroup);
		// This is safe to keep or rely on CascadeType.ALL + orphanRemoval=true (which
		// ProjectGroupDetails has).
		// If orphanRemoval=true, removing from list and saving ProjectGroup would match
		// `delete`.
		// But direct `taskRepository.delete(task)` is also fine if `projectGroup` is
		// not re-saved with the stale list in the same transaction.
		// To be safe and consistent with previous logic:
		projectGroup.getScheduleTask().remove(task);
		projectGroupRepository.save(projectGroup);
	}

	public Page<ProjectDTO> getAllProjects(Pageable pageable, String status) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Long companyId = tokenInfo.getCompanyId();

		Page<ProjectGroupDetails> projectsPage;
		if (status != null && !status.isEmpty()) {
			projectsPage = projectGroupRepository.findByCompanyIdAndStatus(companyId, status, pageable);
		} else {
			projectsPage = projectGroupRepository.findByCompanyId(companyId, pageable);
		}

		return projectsPage.map(this::mapToProjectDTO);
	}

	public ProjectDTO getProjectById(Long projectId) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Long companyId = tokenInfo.getCompanyId();

		ProjectGroupDetails project = projectGroupRepository.findById(projectId)
				.orElseThrow(() -> new NotFoundException("Project not found"));

		if (!project.getCompanyId().equals(companyId)) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}

		// Ideally, we shouldn't return tasks here if we have a separate endpoint for
		// tasks.
		// But for backward compatibility or convenience, we might want to.
		// The DTO I created `ProjectDTO` does NOT have a list of Tasks.
		// So I will just return the Project details.

		return mapToProjectDTO(project);
	}

	public Page<TaskDTO> getTasksByProjectId(Long projectId, Pageable pageable) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Long companyId = tokenInfo.getCompanyId();

		ProjectGroupDetails project = projectGroupRepository.findById(projectId)
				.orElseThrow(() -> new NotFoundException("Project not found"));

		if (!project.getCompanyId().equals(companyId)) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}

		Page<Task> tasksPage = taskRepository.findByProjectGroup_ProjectId(projectId, pageable);
		return tasksPage.map(this::mapToTaskDTO);
	}

	private TaskDTO mapToTaskDTO(Task task) {
		TaskDTO dto = new TaskDTO();
		dto.setId(task.getId());
		dto.setName(task.getTaskName());
		dto.setDescription(task.getDescription());
		dto.setStatus(task.getStatus());
		dto.setPriority(task.getPriority());
		dto.setDeadline(task.getDeadlineTimestamp());
		dto.setAssignedAt(task.getAssignedTimestamp());
		dto.setCompletedAt(task.getCompletionTime());
		dto.setAssignedBy(task.getAssignedBy());
		dto.setProjectId(task.getProjectGroup().getProjectId());
		dto.setAssignedEmployeeIds(
				task.getAssignedEmployees().stream().map(Employee::getId).collect(Collectors.toList()));
		return dto;
	}

	// public ResponseEntity<ResponseDTO<Map<String, Object>>>
	// assignTaskToParticipant(Map<String, ?> request) {
	// // Fetch project group
	// Long projectGroupId =
	// Long.parseLong(request.get(Constants.PROJECT_GROUPID).toString());
	// ProjectGroupDetails projectGroup =
	// projectGroupRepository.findById(projectGroupId)
	// .orElseThrow(() -> new NotFoundException("Project Group not found"));
	//
	// // Get task details
	// @SuppressWarnings("unchecked")
	// List<Map<String, Object>> taskList = (List<Map<String, Object>>)
	// request.get("tasks");
	//
	// for (Map<String, Object> taskData : taskList) {
	// Task task = new Task();
	// task.setTaskName((String) taskData.get("taskName"));
	// task.setDescription((String) taskData.get("description"));
	// task.setAssignedTimestamp(LocalDateTime.now());
	// task.setDeadlineTimestamp(LocalDateTime.parse((String)
	// taskData.get("deadlineTimestamp")));
	// task.setStatus("open");
	//
	// // Get the ID of the person assigning the task (assignedBy)
	// Long assignedById = Long.parseLong(taskData.get("assignedBy").toString());
	//
	// // Validate that the assignee (assignedBy) is part of the project group
	// boolean isValidParticipant = projectGroup.getParticipants().stream()
	// .anyMatch(participant ->
	// Long.valueOf(participant.getId()).equals(assignedById));
	//
	// if (!isValidParticipant) {
	// throw new ForBiddenException("Only a valid participant can assign tasks to
	// themselves");
	// }
	//
	// // Set assignedBy to the valid participant
	// task.setAssignedBy(assignedById);
	//
	// task.setEmail((String) taskData.get("email"));
	// task.setProjectGroup(projectGroup);
	//
	// // Get assigned employee IDs (assignedEmployees) - these should be the same
	// as
	// // assignedBy for self-assignment
	// @SuppressWarnings("unchecked")
	// List<Integer> assignedEmployeeIds = (List<Integer>)
	// taskData.get("assignedEmployees");
	// List<Long> longAssignedEmployeeIds =
	// assignedEmployeeIds.stream().map(Integer::longValue) // Convert Integer
	// // to Long
	// .collect(Collectors.toList());
	//
	// // Ensure the employee is assigning the task to themselves
	// if (longAssignedEmployeeIds.size() != 1 ||
	// !longAssignedEmployeeIds.get(0).equals(assignedById)) {
	// throw new ForBiddenException("The task can only be assigned to the
	// participant themselves");
	// }
	//
	// List<Employee> assignedEmployees = new ArrayList<>();
	//
	// // Validate that the assigned employees are part of the project group
	// for (Long assignedEmployeeId : longAssignedEmployeeIds) {
	// Employee employee = projectGroup.getParticipants().stream()
	// .filter(e -> Long.valueOf(e.getId()).equals(assignedEmployeeId)).findFirst()
	// .orElseThrow(() -> new NotFoundException(
	// "Employee with ID " + assignedEmployeeId + " is not a participant"));
	// assignedEmployees.add(employee);
	// }
	//
	// task.setAssignedEmployees(assignedEmployees);
	// taskRepository.save(task);
	//
	// // Add task to the schedule
	// projectGroup.getScheduleTask().add(task);
	// }
	//
	public Page<TaskDTO> getTasksByEmployeeAndProject(Long employeeId, Long projectId, Pageable pageable) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Long companyId = tokenInfo.getCompanyId();

		ProjectGroupDetails projectGroup = projectGroupRepository.findById(projectId)
				.orElseThrow(() -> new NotFoundException("Project group not found"));

		if (!projectGroup.getCompanyId().equals(companyId)) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}

		Employee employee = employeeRepo.findById(employeeId)
				.orElseThrow(() -> new NotFoundException("Employee not found"));

		// Permission check
		Long userId = tokenInfo.getUserId();
		Long userRole = tokenInfo.getRole();
		boolean isAdminOrExecutive = (userRole != null && (userRole.equals(1L) || userRole.equals(2L)));
		boolean isSelf = userId.equals(employeeId);
		boolean isLeader = projectGroup.getGroupLeaders().stream().anyMatch(e -> e.getId() == userId);
		boolean isCreator = projectGroup.getCreatedById().equals(userId);

		if (!isAdminOrExecutive && !isSelf && !isLeader && !isCreator) {
			throw new ForBiddenException("You are not authorized to view tasks for this employee");
		}

		Page<Task> tasks = taskRepository.findByAssignedEmployees_IdAndProjectGroup_ProjectId(employeeId, projectId,
				pageable);
		return tasks.map(this::mapToTaskDTO);
	}

	public TaskDTO createTask(CreateTaskRequest request) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Long companyId = tokenInfo.getCompanyId();
		Long userId = tokenInfo.getUserId();

		ProjectGroupDetails project = projectGroupRepository.findById(request.getProjectId())
				.orElseThrow(() -> new NotFoundException("Project not found"));

		if (!project.getCompanyId().equals(companyId)) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}

		Task task = new Task();
		task.setTaskName(request.getTaskName());
		task.setDescription(request.getDescription());
		task.setStatus("open");
		task.setPriority(request.getPriority());
		task.setAssignedTimestamp(LocalDateTime.now());
		task.setDeadlineTimestamp(request.getDeadlineTimestamp());
		task.setProjectGroup(project);
		task.setCompanyId(companyId);
		task.setAssignedBy(userId);

		if (request.getAssignedEmployeeIds() != null && !request.getAssignedEmployeeIds().isEmpty()) {
			List<Employee> employees = employeeRepo.findAllById(request.getAssignedEmployeeIds());
			task.setAssignedEmployees(employees);
		}

		task = taskRepository.save(task);
		return mapToTaskDTO(task);
	}

	public void updateProjectStatus(Long projectId, String newStatus) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Long companyId = tokenInfo.getCompanyId();
		Long userId = tokenInfo.getUserId();
		Long userRole = tokenInfo.getRole();

		ProjectGroupDetails project = projectGroupRepository.findById(projectId)
				.orElseThrow(() -> new NotFoundException("Project with ID " + projectId + " not found."));

		if (!project.getCompanyId().equals(companyId)) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}

		// Permission Check: Admin, Creator, or Leader
		boolean isCreator = project.getCreatedById().equals(userId);
		boolean isLeader = project.getGroupLeaders().stream().anyMatch(e -> e.getId() == userId);
		boolean isAdminOrExecutive = (userRole != null && (userRole == 1 || userRole == 2));

		if (!isCreator && !isLeader && !isAdminOrExecutive) {
			throw new ForBiddenException("You are not authorized to update project status");
		}

		if ("closed".equalsIgnoreCase(newStatus)) {
			List<Task> tasks = taskRepository.findByProjectGroup_ProjectId(projectId);
			boolean allTasksClosed = tasks.stream().allMatch(task -> "closed".equalsIgnoreCase(task.getStatus()));
			if (!allTasksClosed) {
				throw new IllegalArgumentException("Complete all tasks before closing the project.");
			}
		}

		project.setStatus(newStatus);
		projectGroupRepository.save(project);
	}

	public Page<ProjectDTO> getProjectsByClientId(Long clientId, Pageable pageable) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Long companyId = tokenInfo.getCompanyId();

		// Ensure current user (if client) can only access own projects.
		// Or if Admin can access any client's projects within company.

		Page<ProjectGroupDetails> projects = projectGroupRepository.findByClient_ClientIdAndCompanyId(clientId,
				companyId, pageable);
		return projects.map(this::mapToProjectDTO);
	}

	public void addParticipants(AddParticipantRequest request) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Long companyId = tokenInfo.getCompanyId();
		Long userId = tokenInfo.getUserId();
		Long userRole = tokenInfo.getRole();

		ProjectGroupDetails project = projectGroupRepository.findById(request.getProjectId())
				.orElseThrow(() -> new NotFoundException("Project not found"));

		if (!project.getCompanyId().equals(companyId)) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}

		// Permission: Creator, Leader, Admin
		boolean isCreator = project.getCreatedById().equals(userId);
		boolean isLeader = project.getGroupLeaders().stream().anyMatch(e -> e.getId() == userId);
		boolean isAdminOrExecutive = (userRole != null && (userRole == 1 || userRole == 2));

		if (!isCreator && !isLeader && !isAdminOrExecutive) {
			throw new ForBiddenException("You are not authorized to add participants");
		}

		List<Employee> employees = employeeRepo.findAllById(request.getEmployeeIds());
		List<ProjectParticipant> newParticipants = new ArrayList<>();

		for (Employee employee : employees) {
			boolean exists = participantRepository.existsByProjectGroupAndEmployee(project, employee);
			if (!exists) {
				ProjectParticipant participant = new ProjectParticipant();
				participant.setProjectGroup(project);
				participant.setEmployee(employee);
				participant.setRole("Member");
				newParticipants.add(participant);
			}
		}

		if (!newParticipants.isEmpty()) {
			participantRepository.saveAll(newParticipants);
		}
	}

	public void removeParticipant(Long projectId, Long employeeId) {
		TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Long companyId = tokenInfo.getCompanyId();
		Long userId = tokenInfo.getUserId();
		Long userRole = tokenInfo.getRole();

		ProjectGroupDetails project = projectGroupRepository.findById(projectId)
				.orElseThrow(() -> new NotFoundException("Project not found"));

		if (!project.getCompanyId().equals(companyId)) {
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}

		// Permission: Creator, Leader, Admin
		boolean isCreator = project.getCreatedById().equals(userId);
		boolean isLeader = project.getGroupLeaders().stream().anyMatch(e -> e.getId() == userId);
		boolean isAdminOrExecutive = (userRole != null && (userRole == 1 || userRole == 2));

		if (!isCreator && !isLeader && !isAdminOrExecutive) {
			throw new ForBiddenException("You are not authorized to remove participants");
		}

		Employee employee = employeeRepo.findById(employeeId)
				.orElseThrow(() -> new NotFoundException("Employee not found"));

		ProjectParticipant participant = participantRepository.findByProjectGroupAndEmployee(project, employee)
				.orElseThrow(() -> new NotFoundException("Participant not found in this project"));

		participantRepository.delete(participant);
	}
}
