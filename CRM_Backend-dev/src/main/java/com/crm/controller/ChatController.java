package com.crm.controller;

import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.crm.model.dto.ResponseDTO;
import com.crm.service.ChatService;
import com.crm.utility.RequestValidator;

@RestController
@RequestMapping(value = "/secured/user/chat")
public class ChatController {

	private static final Logger logger = LogManager.getLogger(ChatController.class.getName());

	@Autowired
	private ChatService chatService;
	
	@PostMapping(value = "/start-chat")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> startChat(@RequestBody Map<String, ?> entity) {
        new RequestValidator(entity).hasId(Keys.USER_ID, true).hasId(Keys.OTHER_USER_ID, true);
        return chatService.startChat(entity);
    }
	
	 @PostMapping(value = "/send-messages")
	    public ResponseEntity<ResponseDTO<Map<String, Object>>> sendMessage(@RequestBody Map<String, ?> entity) {
	        new RequestValidator(entity).hasId(Keys.USER_ID, true).hasId(Keys.USERCHAT_ID, true)
	                .hasString(Keys.USERCHAT_MESSAGE);
	        return chatService.sendMessage(entity);
	    }

	  @PostMapping(value = "/get-chats")
	    public ResponseEntity<ResponseDTO<Map<String, Object>>> getChats(@RequestBody Map<String, ?> entity,
	            @RequestParam(name = "num", required = true) Integer pageNum,
	            @RequestParam(name = "size", required = true) Integer pageSize) {
	        new RequestValidator(entity).hasId(Keys.USER_ID, true)
	        .hasPagination(pageNum, pageSize);
	        return chatService.getChats(entity, pageNum, pageSize);
	    }

	   @PostMapping(value = "/get-messages")
	    public ResponseEntity<ResponseDTO<Map<String, Object>>> getMessages(@RequestBody Map<String, ?> entity,
	            @RequestParam(name = "num", required = true) Integer pageNum,
	            @RequestParam(name = "size", required = true) Integer pageSize) {
	        new RequestValidator(entity).hasId(Keys.USER_ID, true).hasId(Keys.USERCHAT_ID, true)
	                .hasPagination(pageNum, pageSize);
	        return chatService.getMessages(entity, pageNum, pageSize);
	    }
}
