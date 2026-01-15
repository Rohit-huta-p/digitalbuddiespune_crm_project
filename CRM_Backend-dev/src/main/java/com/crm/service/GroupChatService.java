package com.crm.service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.crm.controller.Keys;
import com.crm.exception.ForBiddenException;
import com.crm.exception.NotFoundException;
import com.crm.model.Employee;
import com.crm.model.GroupChat;
import com.crm.model.GroupMessage;
import com.crm.model.dto.ResponseDTO;
import com.crm.repos.EmployeeRepo;
import com.crm.repos.GroupChatRepository;
import com.crm.repos.GroupMessageRepository;
import com.crm.utility.Constants;
import com.crm.utility.JwtBasedCurrentUserProvider;

@Service
public class GroupChatService {

	@Autowired
	private GroupChatRepository groupChatRepository;

	@Autowired
	private GroupMessageRepository groupMessageRepository;

	@Autowired
	private EmployeeRepo employeeRepo;

	@Autowired
	private NotificationService notificationService;
	
	@Autowired
	private JwtBasedCurrentUserProvider basedCurrentUserProvider;

	public ResponseEntity<ResponseDTO<Map<String, Object>>> createGroupChat(Map<String, ?> entity) {
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(entity.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		
		Long createdById = Long.parseLong(entity.get(Keys.CREATEDBY).toString());
		String groupName = entity.get(Keys.GROUPNAME).toString();
		String groupDesc = entity.get(Keys.GROUPDESC) != null ? entity.get(Keys.GROUPDESC).toString() : "";
		String groupLeaderStr = entity.get("groupLeader") != null ? entity.get(Keys.GROUPLEADER).toString().trim()
				: null;
		Long groupLeader = (groupLeaderStr != null && !groupLeaderStr.isEmpty()) ? Long.parseLong(groupLeaderStr)
				: null;

		List<?> rawParticipantIds = (List<?>) entity.get(Keys.PARTICIPANTS);
		List<Long> participantIds = rawParticipantIds.stream().map(id -> ((Number) id).longValue())
				.collect(Collectors.toList());

		List<Employee> participants = employeeRepo.findAllById(participantIds);

		if (participants.isEmpty()) {
			throw new NotFoundException("No valid participants found.");
		}
		Set<Long> foundIds = participants.stream().map(Employee::getId).collect(Collectors.toSet());

		if (!employeeRepo.existsById(createdById)) {
			throw new NotFoundException("Created by ID " + createdById + " is not present.");
		}

		List<Long> invalidIds = participantIds.stream().filter(id -> !foundIds.contains(id))
				.collect(Collectors.toList());

		if (!invalidIds.isEmpty()) {
			throw new NotFoundException("Invalid participant IDs: " + invalidIds);
		}

		// Check if groupLeader is part of the participants
		if (groupLeader != null && !foundIds.contains(groupLeader)) {
			throw new NotFoundException("Group leader must be a participant in the group.");
		}

		GroupChat groupChat = new GroupChat();
		groupChat.setCreatedById(createdById);
		groupChat.setGroupName(groupName);
		groupChat.setGroupDesc(groupDesc);
		groupChat.setParticipants(participants);
		groupChat.setGroupLeader(groupLeader);
		groupChat.setCompanyId(requestCompanyId);

		groupChat = groupChatRepository.save(groupChat);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("group_id", groupChat.getGroupId());

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> getUserGroups(Map<String, ?> entity, Integer pageNum,
			Integer pageSize) {

		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(entity.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		Long createdById = Long.parseLong(entity.get(Keys.CREATEDBY).toString());

		
		Pageable pageable = PageRequest.of(Math.max(0, pageNum - 1), pageSize, Sort.by(Sort.Order.asc("createdAt")));

		Page<GroupChat> groupsPage = groupChatRepository.findByCreatedByIdAndCompanyId(createdById, requestCompanyId,pageable);

		if (groupsPage.isEmpty()) {
			throw new NotFoundException("No groups found for user ID " + createdById);
		}

		List<Map<String, Object>> responseList = groupsPage.stream().map(group -> {
			Map<String, Object> groupData = new HashMap<>();
			groupData.put("groupId", group.getGroupId());
			groupData.put("groupName", group.getGroupName());
			groupData.put("groupDesc", group.getGroupDesc());
			groupData.put("createdById", group.getCreatedById());
			groupData.put("createdAt", group.getCreatedAt());
			groupData.put("groupLeader", group.getGroupLeader());
			groupData.put(Constants.COMPANY_ID,group.getCompanyId());
			List<Map<String, Object>> participants = group.getParticipants().stream().map(emp -> {
				Map<String, Object> participant = new HashMap<>();
				participant.put("id", emp.getId());
				participant.put("name", emp.getName());
				return participant;
			}).collect(Collectors.toList());

			groupData.put("participants", participants);
			return groupData;
		}).collect(Collectors.toList());

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("groups", responseList);
		responseAttributes.put("totalGroups", groupsPage.getTotalElements());
		responseAttributes.put("totalPages", groupsPage.getTotalPages());
		responseAttributes.put("currentPage", pageNum);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> getGroupById(Map<String, ?> entity) {

		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(entity.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		Long groupId = Long.parseLong(entity.get(Keys.GROUPID).toString());

		Optional<GroupChat> optionalGroup = groupChatRepository.findById(groupId);

		if (optionalGroup.isEmpty()) {
			throw new NotFoundException("No group found with ID " + groupId);
		}

		GroupChat group = optionalGroup.get();
		if(group.getCompanyId()!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		Map<String, Object> groupData = new HashMap<>();

		groupData.put("groupId", group.getGroupId());
		groupData.put("groupName", group.getGroupName());
		groupData.put("groupDesc", group.getGroupDesc());
		groupData.put("createdById", group.getCreatedById());
		groupData.put("createdAt", group.getCreatedAt());
		groupData.put("groupLeader", group.getGroupLeader());
		groupData.put(Constants.COMPANY_ID,group.getCompanyId());
		List<Map<String, Object>> participants = group.getParticipants().stream().map(emp -> {
			Map<String, Object> participant = new HashMap<>();
			participant.put("id", emp.getId());
			participant.put("name", emp.getName());
			return participant;
		}).collect(Collectors.toList());

		groupData.put("participants", participants);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(groupData);

		return ResponseEntity.ok(responseDTO);
	}
	
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getGroupsByEmployeeId(Map<String, ?> entity, Integer pageNum, Integer pageSize) {
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(entity.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
	    Long employeeId = Long.parseLong(entity.get(Keys.ID).toString());

	    // Fetch the groups where the employee is a participant
	    Pageable pageable = PageRequest.of(Math.max(0, pageNum - 1), pageSize, Sort.by(Sort.Order.asc("createdAt")));
	    
	    // Using the pageable for paginated results
	    Page<GroupChat> groupsPage = groupChatRepository.findByParticipantsEmployeeId(employeeId, pageable);

	    if (groupsPage.isEmpty()) {
	        throw new NotFoundException("No groups found for employee with ID " + employeeId);
	    }

	    // Convert the page to a list of group data
	    List<Map<String, Object>> groupDataList = groupsPage.getContent().stream().map(group -> {
	        Map<String, Object> groupData = new HashMap<>();
	        groupData.put("groupId", group.getGroupId());
	        groupData.put("groupName", group.getGroupName());
	        groupData.put("groupDesc", group.getGroupDesc());
	        groupData.put("createdById", group.getCreatedById());
	        groupData.put("createdAt", group.getCreatedAt());
	        groupData.put("groupLeader", group.getGroupLeader());
	        groupData.put(Constants.COMPANY_ID,group.getCompanyId());
	        // Optionally, add participants
	        List<Map<String, Object>> participants = group.getParticipants().stream().map(emp -> {
	            Map<String, Object> participant = new HashMap<>();
	            participant.put("id", emp.getId());
	            participant.put("name", emp.getName());
	            return participant;
	        }).collect(Collectors.toList());

	        groupData.put("participants", participants);
	        return groupData;
	    }).collect(Collectors.toList());

	    // Add pagination details to the response
	    Map<String, Object> responseAttributes = new HashMap<>();
	    responseAttributes.put("groups", groupDataList);
	    responseAttributes.put("totalGroups", groupsPage.getTotalElements());
	    responseAttributes.put("totalPages", groupsPage.getTotalPages());
	    responseAttributes.put("currentPage", pageNum);

	    ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
	    responseDTO.setAttributes(responseAttributes);

	    return ResponseEntity.ok(responseDTO);
	}


	public ResponseEntity<ResponseDTO<Map<String, Object>>> sendMessage(Map<String, ?> entity) {
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(entity.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		Long messageBy = Long.parseLong(entity.get(Keys.MESSAGEBY).toString());
		Long groupId = Long.parseLong(entity.get(Keys.GROUPID).toString());
		String message = entity.get(Keys.MESSAGE).toString();

		GroupChat groupChat = groupChatRepository.findById(groupId)
				.orElseThrow(() -> new NotFoundException("Group chat not found."));
		if(groupChat.getCompanyId()!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		boolean isParticipant = groupChat.getParticipants().stream().anyMatch(emp -> emp.getId() == (messageBy));

		if (!isParticipant) {
			throw new NotFoundException("User ID " + messageBy + " is not a participant of this group.");
		}
		GroupMessage groupMessage = new GroupMessage();
		groupMessage.setGroupChat(groupChat);
		groupMessage.setMessageBy(messageBy);
		groupMessage.setMessage(message);

		groupMessageRepository.save(groupMessage);
		for (Employee participant : groupChat.getParticipants()) {
			if (participant.getId() != messageBy) { // Exclude sender
				Map<String, Object> notificationData = Map.of("id", participant.getId(), "notificationTitle",
						groupChat.getGroupName(), "notificationText", message);
				notificationService.createNotification(notificationData);
			}
		}

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message_id", groupMessage.getMessageId());

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> getGroupMessages(Map<String, ?> entity, Integer pageNum,
			Integer pageSize) {
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(entity.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		Long groupId = Long.parseLong(entity.get(Keys.GROUPID).toString());
		Long employeeId = Long.parseLong(entity.get(Keys.ID).toString());
		GroupChat groupChat = groupChatRepository.findById(groupId)
				.orElseThrow(() -> new NotFoundException("Group chat not found."));
			
		if(groupChat.getCompanyId()!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		Set<Long> participantIds = groupChat.getParticipants().stream()
		        .map(participant -> participant.getId())  // Extract employeeIds from participants
		        .collect(Collectors.toSet());  // Collect employeeIds into a Set

		// Check if the employeeId is in the Set of participantIds
		if (!participantIds.contains(employeeId)) {
		    throw new ForBiddenException("Employee is not a participant of the group.");
		}

		Pageable pageable = PageRequest.of(Math.max(0, pageNum - 1), pageSize, Sort.by(Sort.Order.asc("createdAt")));

		Page<GroupMessage> messagesPage = groupMessageRepository.findByGroupChatGroupId(groupId, pageable);

		List<Map<String, Object>> messageList = messagesPage.getContent().stream().map(message -> {
			Map<String, Object> messageData = new HashMap<>();
			messageData.put("messageId", message.getMessageId());
			messageData.put("messageBy", message.getMessageBy());
			messageData.put("message", message.getMessage());
			messageData.put("createdAt", message.getCreatedAt());
			return messageData;
		}).collect(Collectors.toList());

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("messages", messageList);
		responseAttributes.put("totalMessages", messagesPage.getTotalElements());
		responseAttributes.put("totalPages", messagesPage.getTotalPages());
		responseAttributes.put("currentPage", pageNum);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}
}
