package com.crm.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.crm.controller.Keys;
import com.crm.exception.ForBiddenException;
import com.crm.exception.NotFoundException;
import com.crm.model.ChatInfo;
import com.crm.model.ChatMessage;
import com.crm.model.DateTimeHelper;
import com.crm.model.Employee;
import com.crm.model.dto.ResponseDTO;
import com.crm.repos.ChatInfoRepository;
import com.crm.repos.ChatMessageRepository;
import com.crm.repos.EmployeeRepo;
import com.crm.utility.ObjectParserUtil;

@Service
public class ChatService {

	@Autowired
	private ChatInfoRepository chatInfoRepository;

	@Autowired
	private ChatMessageRepository chatMessageRepository;

	@Autowired
	private EmployeeRepo employeeRepo;
	
	@Autowired 
	private NotificationService notificationService;

	public static final Logger LOG = LogManager.getLogger();

	public ResponseEntity<ResponseDTO<Map<String, Object>>> startChat(Map<String, ?> entity) {
		Long thisUserId = Long.parseLong(entity.get(Keys.USER_ID).toString());
		Long otherUserId = Long.parseLong(entity.get(Keys.OTHER_USER_ID).toString());

		if (!employeeRepo.existsById(thisUserId) || !employeeRepo.existsById(otherUserId)) {
			throw new NotFoundException("Employee not found.");
		}

		Optional<ChatInfo> chatInfoOptional = chatInfoRepository.findChatByUserIds(thisUserId, otherUserId);
		ChatInfo chatInfo;
		Integer chatId;

		if (chatInfoOptional.isPresent()) {
			chatId = chatInfoOptional.get().getChatId();
		} else {
			chatInfo = new ChatInfo();
			chatInfo.setStartedBy(thisUserId);
			chatInfo.setReceivedBy(otherUserId);
			chatId = chatInfoRepository.save(chatInfo).getChatId();
		}

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("chat_id", chatId.toString());

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}


	public ResponseEntity<ResponseDTO<Map<String, Object>>> sendMessage(Map<String, ?> entity) {
		Long userId = Long.parseLong(entity.get(Keys.USER_ID).toString());
		Integer chatId = Integer.parseInt(entity.get(Keys.USERCHAT_ID).toString());

		ChatInfo chatInfo = chatInfoRepository.findById(chatId)
				.orElseThrow(() -> new NotFoundException("Chat with ID " + chatId + " not found."));

		if (!chatInfo.getStartedBy().equals(userId) && !chatInfo.getReceivedBy().equals(userId)) {
			throw new ForBiddenException("User is not allowed to send a message to this chat.");
		}

		chatInfo.setLastMessageSentBy(userId);
		chatInfo.setLastMessageSentOn(DateTimeHelper.getCurrentTime());
		chatInfo.setLastMessageSeen(false);
		chatInfoRepository.save(chatInfo);

		ChatMessage chatMessage = new ChatMessage();
		chatMessage.setChatInfo(chatInfo);
		chatMessage.setMessageBy(userId);
		chatMessage.setMessage(entity.get(Keys.USERCHAT_MESSAGE).toString());
		chatMessage.setCreatedAt(DateTimeHelper.getCurrentTime());
		chatMessage.setSeen(false);

		ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
		Integer chatMessageId = savedMessage.getChatMessageId();
		
		 // Determine the recipient of the message
	    Long recipientId = chatInfo.getStartedBy().equals(userId) ? chatInfo.getReceivedBy() : chatInfo.getStartedBy();
	    String messageText = entity.get(Keys.USERCHAT_MESSAGE).toString(); 
	    // Create a notification for the recipient
	    Map<String, Object> notificationData = new HashMap<>();
	    notificationData.put("id", recipientId);
	    notificationData.put("notificationTitle", "New Message");
	    notificationData.put("notificationText", messageText);

	    notificationService.createNotification(notificationData);

		
		
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put(Keys.USERCHAT_MESSAGE_ID, chatMessageId.toString());

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> getChats(Map<String, ?> entity, Integer pageNum,
			Integer pageSize) {

		Long userId = Long.parseLong(entity.get(Keys.USER_ID).toString());

		Employee employee = employeeRepo.findById(userId)
				.orElseThrow(() -> new NotFoundException("User with ID " + userId + " not found."));

		Pageable pageable = PageRequest.of(Math.max(0, pageNum - 1), pageSize, Sort.by(Sort.Order.asc("createdAt")));
		
		Page<ChatInfo> chats = chatInfoRepository.findChatsByUserId(userId, pageable);

		List<Map<String, Object>> parsedChats = ObjectParserUtil.parseChats(chats, userId);

		parsedChats.forEach(chatInfo -> {
			Integer chatId = Integer.parseInt(chatInfo.get(Keys.USERCHAT_ID).toString());
			List<ChatMessage> latestMessages = chatMessageRepository.findLatestMessageForChat(chatId);

			String latestMessage = latestMessages.isEmpty() ? null : latestMessages.get(0).getMessage();
			chatInfo.put(Keys.LAST_MESSAGE, latestMessage);
		});

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("chats", parsedChats);
		responseAttributes.put("totalChats", chats.getTotalElements());
		responseAttributes.put("totalPages", chats.getTotalPages());
		responseAttributes.put("currentPage", pageNum);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> getMessages(Map<String, ?> entity, Integer pageNum,
            Integer pageSize) {
        Long userId = Long.parseLong(entity.get(Keys.USER_ID).toString());
        Integer chatId = Integer.parseInt(entity.get(Keys.USERCHAT_ID).toString());

        ChatInfo chatInfo = chatInfoRepository.findById(chatId)
                .orElseThrow(() -> new NotFoundException("Chat with ID " + chatId + " not found."));

        if (!chatInfo.getStartedBy().equals(userId) && !chatInfo.getReceivedBy().equals(userId)) {
            throw new ForBiddenException("User is not allowed to view messages in this chat.");
        }

        List<ChatMessage> allMessages = chatMessageRepository.getMessagesByChatId(chatId);

        allMessages.forEach(msg -> {
            if (!msg.isSeen()) {
                LOG.info("set as true");
                msg.setSeen(true);
                chatMessageRepository.save(msg);
            }
        });

        Pageable pageable = PageRequest.of(pageNum - 1, pageSize, Sort.by(Sort.Order.desc("createdAt")));
        Page<ChatMessage> messagesPage = chatMessageRepository.getMessagesByChatId(chatId, pageable);

        List<Map<String, Object>> responseMessages = messagesPage.getContent().stream().map(msg -> {
            Map<String, Object> messageData = new HashMap<>();
            messageData.put("message_id", msg.getChatMessageId());
            messageData.put("message", msg.getMessage());
            messageData.put("sent_by", msg.getMessageBy());
            messageData.put("sent_at", msg.getCreatedAt());
            messageData.put("seen", msg.isSeen());
            return messageData;
        }).collect(Collectors.toList());

        Map<String, Object> responseAttributes = new HashMap<>();
        responseAttributes.put("messages", responseMessages);
        responseAttributes.put("totalMessages", messagesPage.getTotalElements());
        responseAttributes.put("totalPages", messagesPage.getTotalPages());
        responseAttributes.put("currentPage", messagesPage.getNumber() + 1);

        ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
        responseDTO.setAttributes(responseAttributes);
        return ResponseEntity.ok(responseDTO);
    }

}
