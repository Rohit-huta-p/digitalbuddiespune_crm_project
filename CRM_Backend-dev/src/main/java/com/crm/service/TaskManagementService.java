package com.crm.service;

import com.crm.controller.Keys;
import com.crm.exception.BadRequestException;
import com.crm.exception.DuplicateResourceException;
import com.crm.exception.ForBiddenException;
import com.crm.exception.NotFoundException;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crm.model.Employee;
import com.crm.model.GroupChat;
import com.crm.model.Task;
import com.crm.repos.EmployeeRepo;
import com.crm.repos.GroupChatRepository;
import com.crm.repos.TaskManagementRepository;
import com.crm.utility.Constants;
import com.crm.utility.JwtBasedCurrentUserProvider;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;

@Service
public class TaskManagementService {

	private static final Logger LOGGER = LoggerFactory.getLogger(TaskManagementService.class);

	@Autowired
	TaskManagementRepository taskRepository;

	@Autowired
	EmployeeRepo employeeRepo;

	@Autowired
	NotificationService notificationService;

	@Autowired
	GroupChatRepository groupChatRepository;
	
	@Autowired
	private JwtBasedCurrentUserProvider basedCurrentUserProvider;

    public void createTask(Map<String, ?> taskData) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        Long requestCompanyId = Long.parseLong(taskData.get(Constants.COMPANY_ID).toString());
        if (!companyId.equals(requestCompanyId)) throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);

        Task task = new Task();
        task.setTaskName((String) taskData.get(Constants.FIELD_TASK_NAME));
        task.setDescription(taskData.getOrDefault(Constants.FIELD_DESCRIPTION, null) != null
                ? taskData.get(Constants.FIELD_DESCRIPTION).toString() : null);
        task.setAssignedTimestamp(LocalDateTime.now());
        task.setDeadlineTimestamp(LocalDateTime.parse((String) taskData.get(Constants.FIELD_DEADLINE_TIMESTAMP)));
        task.setEmail((String) taskData.get(Constants.FIELD_EMAIL));
        task.setPriority((String) taskData.get(Constants.PRIORITY));
        task.setCompanyId(requestCompanyId);
        task.setStatus(taskData.get(Constants.FIELD_STATUS).toString().toLowerCase());
        task.setAssignedBy(Long.valueOf(taskData.get(Constants.FIELD_ASSIGNED_BY).toString()));

        @SuppressWarnings("unchecked")
        List<Integer> employeeIds = (List<Integer>) taskData.get(Constants.FIELD_ASSIGNED_TO_EMPLOYEE_ID);
        if (employeeIds == null || employeeIds.isEmpty()) throw new BadRequestException("assignedToEmployeeIds cannot be empty.");

        List<Long> longEmployeeIds = employeeIds.stream().map(Integer::longValue).collect(Collectors.toList());
        List<Employee> assignedEmployees = employeeRepo.findAllById(longEmployeeIds);
        task.setAssignedEmployees(assignedEmployees);

        taskRepository.save(task);

        for (Long employeeId : longEmployeeIds) {
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put(Keys.ID, employeeId);
            notificationData.put(Constants.FIELD_NOTIFICATION_TITLE, "New Task Assigned");
            notificationData.put(Constants.FIELD_NOTIFICATION_TEXT, "You have been assigned a new task: " + task.getTaskName());
            notificationService.createNotification(notificationData);
        }
    }

    public void createGroupTask(Map<String, ?> taskData, Long groupId) {
        Task task = new Task();
        task.setTaskName((String) taskData.get(Constants.FIELD_TASK_NAME));
        task.setDescription(taskData.getOrDefault(Constants.FIELD_DESCRIPTION, null) != null
                ? taskData.get(Constants.FIELD_DESCRIPTION).toString() : null);
        task.setAssignedTimestamp(LocalDateTime.now());
        task.setDeadlineTimestamp(LocalDateTime.parse((String) taskData.get(Constants.FIELD_DEADLINE_TIMESTAMP)));
        task.setEmail((String) taskData.get(Constants.FIELD_EMAIL));
        task.setStatus(taskData.get(Constants.FIELD_STATUS).toString().toLowerCase());
        task.setAssignedBy(Long.valueOf(taskData.get(Constants.FIELD_ASSIGNED_BY).toString()));

        GroupChat groupChat = groupChatRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group with ID " + groupId + " not found."));
        if (!groupChat.getParticipants().stream().anyMatch(emp -> emp.getId() == task.getAssignedBy()))
            throw new ForBiddenException("AssignedBy must be a member of the group.");
        if (!task.getAssignedBy().equals(groupChat.getGroupLeader()))
            throw new ForBiddenException("AssignedBy must be the group leader.");

        @SuppressWarnings("unchecked")
        List<Integer> employeeIds = (List<Integer>) taskData.get(Constants.FIELD_ASSIGNED_TO_EMPLOYEE_ID);
        if (employeeIds == null || employeeIds.isEmpty()) throw new BadRequestException("Assigned employees list cannot be empty.");

        List<Long> longEmployeeIds = employeeIds.stream().map(Integer::longValue).collect(Collectors.toList());
        Set<Long> groupMemberIds = groupChat.getParticipants().stream().map(Employee::getId).collect(Collectors.toSet());
        List<Long> validEmployeeIds = longEmployeeIds.stream().filter(groupMemberIds::contains).collect(Collectors.toList());
        List<Employee> assignedEmployees = employeeRepo.findAllById(validEmployeeIds);
        Set<Long> invalidEmployeeIds = longEmployeeIds.stream().filter(empId -> !groupMemberIds.contains(empId)).collect(Collectors.toSet());
        if (!invalidEmployeeIds.isEmpty()) throw new BadRequestException("Invalid employees assigned: " + invalidEmployeeIds);

        task.setAssignedEmployees(assignedEmployees);
        taskRepository.save(task);

        for (Long employeeId : longEmployeeIds) {
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put(Keys.ID, employeeId);
            notificationData.put(Constants.FIELD_NOTIFICATION_TITLE, "New Task Assigned");
            notificationData.put(Constants.FIELD_NOTIFICATION_TEXT, "You have been assigned a new task: " + task.getTaskName());
            notificationService.createNotification(notificationData);
        }
    }

    public List<Map<String, Object>> getAllTasks(Map<String,?>request) {
		LOGGER.info("Executing getAllTasks()");
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		
		List<Task> tasks = taskRepository.findByCompanyId(requestCompanyId);
		if (tasks.isEmpty()) {
			throw new NotFoundException("Task Not Found");
		}

		return tasks.stream().map(task -> {
			Map<String, Object> taskMap = new HashMap<>();
			taskMap.put("id", task.getId());
			taskMap.put("taskName", task.getTaskName());
			taskMap.put("description", task.getDescription());
			taskMap.put("assignedTimestamp", task.getAssignedTimestamp().toString());
			taskMap.put("deadlineTimestamp", task.getDeadlineTimestamp().toString());
			taskMap.put("status", task.getStatus());
			taskMap.put("assignedBy", task.getAssignedBy());
			taskMap.put("email", task.getEmail());
			taskMap.put("priority", task.getPriority());
			taskMap.put(Constants.COMPANY_ID, task.getCompanyId());
			// ✅ Return assigned employee IDs as a List instead of a String
			List<Long> assignedEmployeeIds = task.getAssignedEmployees().stream().map(Employee::getId)
					.collect(Collectors.toList());
			taskMap.put("assignedToEmployeeId", assignedEmployeeIds);

			return taskMap;
		}).collect(Collectors.toList());
	}
    public Map<String, Object> getEmployeeById(Long employeeId) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found with ID: " + employeeId));
        Map<String, Object> response = new HashMap<>();
        response.put("id", employee.getId());
        response.put("name", employee.getName());
        response.put("email", employee.getEmail());
        response.put("designation", employee.getDesignation());
        return response;
    }

//	public Task updateTask(long id, Map<String, ?> taskData) {
//		Optional<Task> existingTaskOpt = taskRepository.findById(id);
//		if (existingTaskOpt.isEmpty()) {
//			throw new NotFoundException("Task not found with id: " + id);
//		}
//
//		Task existingTask = existingTaskOpt.get();
//		boolean isTaskUpdated = false;
//		taskData.forEach((key, value) -> {
//			switch (key) {
//			case "taskName" -> existingTask.setTaskName((String) value);
//			case "description" -> existingTask.setDescription((String) value);
//			case "assignedTimestamp" -> existingTask.setAssignedTimestamp(LocalDateTime.parse((String) value));
//			case "deadlineTimestamp" -> existingTask.setDeadlineTimestamp(LocalDateTime.parse((String) value));
//			case "status" -> {
//				String statusValue = value.toString().toLowerCase();
//				existingTask.setStatus(statusValue);
//				if ("closed".equals(statusValue)) {
//					Employee creator = employeeRepo.findById(existingTask.getAssignedBy()).orElseThrow(
//							() -> new NotFoundException("Creator not found with ID: " + existingTask.getAssignedBy()));
//					LOGGER.info("creator id" + creator.getId());
//					Map<String, Object> notificationData = new HashMap<>();
//					notificationData.put(Keys.ID, creator.getId());
//					notificationData.put(Constants.FIELD_NOTIFICATION_TITLE, "Task Completed");
//					notificationData.put(Constants.FIELD_NOTIFICATION_TEXT,
//							"The task '" + existingTask.getTaskName() + "' has been marked as complete.");
//					notificationService.createNotification(notificationData);
//				}
//			}
//			case "assignedBy" -> existingTask.setAssignedBy(Long.valueOf(value.toString()));
//			case "email" -> existingTask.setEmail((String) value);
//			case "assignedToEmployeeId" -> {
//				if (value instanceof List<?>) {
//					@SuppressWarnings("unchecked")
//					List<Integer> employeeIds = (List<Integer>) value;
//					List<Long> longEmployeeIds = employeeIds.stream().map(Integer::longValue)
//							.collect(Collectors.toList());
//
//					// Fetch employees from DB
//					List<Employee> assignedEmployees = employeeRepo.findAllById(longEmployeeIds);
//					List<Long> foundEmployeeIds = assignedEmployees.stream().map(Employee::getId)
//							.collect(Collectors.toList());
//
//					List<Long> missingEmployeeIds = longEmployeeIds.stream()
//							.filter(empId -> !foundEmployeeIds.contains(empId)).collect(Collectors.toList());
//
//					if (!missingEmployeeIds.isEmpty()) {
//						throw new NotFoundException("Employees not found with IDs: " + missingEmployeeIds);
//					}
//					existingTask.setAssignedEmployees(assignedEmployees);
//				} else {
//					throw new BadRequestException("assignedToEmployeeIds must be an array.");
//				}
//			}
//			}
//
//		});
//		isTaskUpdated = true;
//		Task updatedTask = taskRepository.save(existingTask);
//
//		if (isTaskUpdated) {
//			for (Employee emp : existingTask.getAssignedEmployees()) {
//				Map<String, Object> notificationData = new HashMap<>();
//				notificationData.put(Keys.ID, emp.getId());
//				notificationData.put(Constants.FIELD_NOTIFICATION_TITLE, "Task Updated");
//				notificationData.put(Constants.FIELD_NOTIFICATION_TEXT,
//						"Task '" + existingTask.getTaskName() + "' has been updated.");
//				notificationService.createNotification(notificationData);
//			}
//		}
//
//		return updatedTask;
//
//	}
public Task updateTask(long id, Map<String, ?> taskData) {
    Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
    Long requestCompanyId = Long.parseLong(taskData.get(Constants.COMPANY_ID).toString());
    if (!companyId.equals(requestCompanyId)) throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);

    Task existingTask = taskRepository.findById(id).orElseThrow(() -> new NotFoundException("Task not found with id: " + id));

    taskData.forEach((key, value) -> {
        if (value == null) return;
        switch (key) {
            case "taskName" -> existingTask.setTaskName((String) value);
            case "description" -> existingTask.setDescription(value.toString());
            case "assignedTimestamp" -> existingTask.setAssignedTimestamp(LocalDateTime.parse((String) value));
            case "deadlineTimestamp" -> existingTask.setDeadlineTimestamp(LocalDateTime.parse((String) value));
            case "priority" -> existingTask.setPriority((String) value);
            case "status" -> {
                String statusValue = value.toString().toLowerCase();
                existingTask.setStatus(statusValue);
                if ("closed".equals(statusValue)) {
                    Employee creator = employeeRepo.findById(existingTask.getAssignedBy())
                            .orElseThrow(() -> new NotFoundException("Creator not found with ID: " + existingTask.getAssignedBy()));
                    existingTask.setCompletionTime(LocalDateTime.now());
                    Map<String, Object> notificationData = new HashMap<>();
                    notificationData.put(Keys.ID, creator.getId());
                    notificationData.put(Constants.FIELD_NOTIFICATION_TITLE, "Task Completed");
                    notificationData.put(Constants.FIELD_NOTIFICATION_TEXT, "Task '" + existingTask.getTaskName() + "' has been marked complete.");
                    notificationService.createNotification(notificationData);
                } else if ("open".equals(statusValue)) existingTask.setCompletionTime(null);
            }
            case "assignedBy" -> existingTask.setAssignedBy(Long.valueOf(value.toString()));
            case "email" -> existingTask.setEmail((String) value);
            case "assignedToEmployeeId" -> {
                @SuppressWarnings("unchecked")
                List<Integer> employeeIds = (List<Integer>) value;
                List<Employee> assignedEmployees = employeeRepo.findAllById(employeeIds.stream().map(Integer::longValue).collect(Collectors.toList()));
                existingTask.setAssignedEmployees(assignedEmployees);
            }
        }
    });

    Task updatedTask = taskRepository.save(existingTask);

    for (Employee emp : existingTask.getAssignedEmployees()) {
        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put(Keys.ID, emp.getId());
        notificationData.put(Constants.FIELD_NOTIFICATION_TITLE, "Task Updated");
        notificationData.put(Constants.FIELD_NOTIFICATION_TEXT, "Task '" + existingTask.getTaskName() + "' has been updated.");
        notificationService.createNotification(notificationData);
    }

    return updatedTask;
}

	public Task updateGroupTask(long id, Map<String, ?> taskData) {
	    Optional<Task> existingTaskOpt = taskRepository.findById(id);
	    Long groupId = Long.parseLong(taskData.get(Keys.GROUPID).toString());

	    if (existingTaskOpt.isEmpty()) {
	        throw new NotFoundException("Task not found with id: " + id);
	    }

	    Task existingTask = existingTaskOpt.get();

	    // Validate assignedBy
	    Long assignedById = Long.valueOf(taskData.get(Constants.FIELD_ASSIGNED_BY).toString());
	    GroupChat groupChat = groupChatRepository.findById(groupId)
	            .orElseThrow(() -> new NotFoundException("Group with ID " + groupId + " not found."));

	    if (!groupChat.getParticipants().stream().anyMatch(emp -> emp.getId() == existingTask.getAssignedBy())) {
	        throw new ForBiddenException("AssignedBy must be a member of the group.");
	    }
	    if (!assignedById.equals(groupChat.getGroupLeader())) {
	        throw new ForBiddenException("AssignedBy must be the group leader.");
	    }

	    // Update task fields
	    taskData.forEach((key, value) -> {
	        switch (key) {
	            case Constants.FIELD_TASK_NAME -> existingTask.setTaskName((String) value);
	            case Constants.FIELD_DESCRIPTION -> existingTask.setDescription((String) value);
	            case Constants.FIELD_DEADLINE_TIMESTAMP -> existingTask.setDeadlineTimestamp(LocalDateTime.parse((String) value));
	            case Constants.FIELD_EMAIL -> existingTask.setEmail((String) value);
	            case Constants.FIELD_STATUS -> existingTask.setStatus(value.toString().toLowerCase());
	        }
	    });

	    // Validate and update assigned employees
	    @SuppressWarnings("unchecked")
	    List<Integer> employeeIds = (List<Integer>) taskData.get(Constants.FIELD_ASSIGNED_TO_EMPLOYEE_ID);
	    if (employeeIds == null || employeeIds.isEmpty()) {
	        throw new BadRequestException("Assigned employees list cannot be empty.");
	    }

	    List<Long> longEmployeeIds = employeeIds.stream().map(Integer::longValue).collect(Collectors.toList());
	    Set<Long> groupMemberIds = groupChat.getParticipants().stream().map(Employee::getId).collect(Collectors.toSet());

	    List<Long> validEmployeeIds = longEmployeeIds.stream().filter(groupMemberIds::contains).collect(Collectors.toList());
	    List<Employee> assignedEmployees = employeeRepo.findAllById(validEmployeeIds);

	    Set<Long> invalidEmployeeIds = longEmployeeIds.stream().filter(empId -> !groupMemberIds.contains(empId))
	            .collect(Collectors.toSet());

	    if (!invalidEmployeeIds.isEmpty()) {
	        throw new BadRequestException("Invalid employees assigned: " + invalidEmployeeIds);
	    }

	    existingTask.setAssignedEmployees(assignedEmployees);
	    taskRepository.save(existingTask);

	    // Send notifications to all group participants
	    for (Long employeeId : longEmployeeIds) {
	        Map<String, Object> notificationData = new HashMap<>();
	        notificationData.put(Keys.ID, employeeId);
	        notificationData.put(Constants.FIELD_NOTIFICATION_TITLE, "Task Updated");
	        notificationData.put(Constants.FIELD_NOTIFICATION_TEXT, 
	                "The task '" + existingTask.getTaskName() + "' has been updated.");

	        notificationService.createNotification(notificationData);
	    }

	    return existingTask;
	}
    public List<Map<String, Object>> getTasksByEmployeeId(Map<String,?> request) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        Long requestCompanyId = Long.parseLong(request.get(Constants.COMPANY_ID).toString());
        if (!companyId.equals(requestCompanyId)) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }

        Long employeeId = Long.parseLong(request.get(Keys.ID).toString());
        List<Task> tasks = taskRepository.findByAssignedEmployees_Id(employeeId);
        if (tasks.isEmpty()) {
            throw new NotFoundException("Task not found for the given employee ID: " + employeeId);
        }

        return tasks.stream().map(task -> {
            Map<String, Object> taskData = new HashMap<>();
            taskData.put("id", task.getId());
            taskData.put("taskName", task.getTaskName());
            taskData.put("description", task.getDescription());
            taskData.put("status", task.getStatus());
            taskData.put("deadline", task.getDeadlineTimestamp());
            taskData.put("assignedBy", task.getAssignedBy());
            taskData.put("priority", task.getPriority());

            // ✅ Include full assigned employee details
            List<Map<String, Object>> assignedEmployeeDetails = task.getAssignedEmployees()
                    .stream()
                    .map(emp -> getEmployeeById(emp.getId()))
                    .collect(Collectors.toList());
            taskData.put("assignedEmployeeDetails", assignedEmployeeDetails);

            return taskData;
        }).collect(Collectors.toList());
    }

	public void deleteTask(Long id,Map<String,?>taskData) {
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(taskData.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		
		if (taskRepository.existsById(id)) {
			taskRepository.deleteById(id);
		} else {
			throw new NotFoundException("Task Not Found with ID: " + id);
		}

	}
	
	public void assignTaskToSelf(Map<String, ?> taskData) {
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(taskData.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
	    // Extract employee ID from the task data
	    Long employeeId = Long.parseLong(taskData.get(Constants.FIELD_ASSIGNED_BY).toString());

	    // Check if the employee exists in the employee table
	    if (!employeeRepo.existsById(employeeId)) {
	        throw new NotFoundException("Employee not found with ID: " + employeeId);
	    }

	    @SuppressWarnings("unchecked")
	    List<Integer> assignedEmployeeIds = (List<Integer>) taskData.get(Constants.FIELD_ASSIGNED_TO_EMPLOYEE_ID);

	    if (assignedEmployeeIds == null || assignedEmployeeIds.isEmpty()) {
	        throw new BadRequestException("assignedToEmployeeIds cannot be empty.");
	    }
	    // Convert Integer list to Long list
	    List<Long> longAssignedEmployeeIds = assignedEmployeeIds.stream()
	            .map(Integer::longValue)  // Convert Integer to Long
	            .collect(Collectors.toList());

	    // Ensure the employee is assigning the task to themselves
	    if (longAssignedEmployeeIds.size() != 1 || !longAssignedEmployeeIds.get(0).equals(employeeId)) {
	        throw new BadRequestException("Employee can only assign the task to themselves.");
	    }

	    // Create and save the task
	    Task task = new Task();
	    task.setTaskName((String) taskData.get(Constants.FIELD_TASK_NAME));
	    task.setDescription((String) taskData.get(Constants.FIELD_DESCRIPTION));
	    task.setAssignedTimestamp(LocalDateTime.now());
	    task.setDeadlineTimestamp(LocalDateTime.parse((String) taskData.get(Constants.FIELD_DEADLINE_TIMESTAMP)));
	    task.setEmail((String) taskData.get(Constants.FIELD_EMAIL));
	    task.setPriority((String)taskData.get(Constants.PRIORITY));
	    String status = taskData.get(Constants.FIELD_STATUS).toString().toLowerCase();
	    task.setStatus(status);
	    task.setCompanyId(requestCompanyId);
	    task.setAssignedBy(employeeId);  // Set the employee assigning to themselves
	    task.setCompanyId(requestCompanyId);
	    // Find the employee from the database using the provided ID
	    Employee assignedEmployee = employeeRepo.findById(employeeId)
	            .orElseThrow(() -> new NotFoundException("Employee not found with ID: " + employeeId));

	    // Assign task to the employee (this assumes 'setAssignedEmployees' expects a list of Employee objects)
	    task.setAssignedEmployees(Collections.singletonList(assignedEmployee)); // Assign task to the employee

	    taskRepository.save(task); // Save the task in the repository

	    // Send notification
	    Map<String, Object> notificationData = new HashMap<>();
	    notificationData.put(Keys.ID, employeeId);
	    notificationData.put(Constants.FIELD_NOTIFICATION_TITLE, "Task Assigned to Yourself");
	    notificationData.put(Constants.FIELD_NOTIFICATION_TEXT, "You have successfully assigned a new task to yourself: " + task.getTaskName());

	    notificationService.createNotification(notificationData); // Send notification
	}

	


}
