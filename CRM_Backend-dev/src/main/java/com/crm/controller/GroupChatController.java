package com.crm.controller;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.crm.model.dto.ResponseDTO;
import com.crm.service.GroupChatService;
import com.crm.utility.Constants;
import com.crm.utility.RequestValidator;

@RestController
@RequestMapping(value = "/secured/user/group-chat")
public class GroupChatController {

    @Autowired
    private GroupChatService groupChatService;

    @PostMapping(value = "/create")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> createGroup(@RequestBody Map<String, ?> entity) {
    	
    	new RequestValidator(entity)
    		.hasValidAssignBy(Keys.CREATEDBY)
    		.hasString(Keys.GROUPNAME)
    		.hasString(Keys.GROUPDESC)
    		.hasValidParticipantIds(Keys.PARTICIPANTS)
    		.hasValidGroupLeader(Keys.GROUPLEADER)
    		.hasId(Constants.COMPANY_ID,true);
    		
    	
        return groupChatService.createGroupChat(entity);
    }

    @PostMapping(value = "/get-groups")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getUserGroups(
            @RequestBody Map<String, ?> entity,
            @RequestParam Integer pageNum, 
            @RequestParam Integer pageSize) {
    	
    	new RequestValidator(entity)
    		.hasId(Keys.CREATEDBY, true)
    		.hasPagination(pageNum, pageSize);
        return groupChatService.getUserGroups(entity, pageNum, pageSize);
    }

    @PostMapping(value = "/get-group-by-id")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getGroupById(@RequestBody Map<String, ?> entity) {
        
        new RequestValidator(entity)
            .hasId(Keys.GROUPID, true) // Validate that groupId is provided
        	.hasId(Constants.COMPANY_ID, true);
        
        return groupChatService.getGroupById(entity);
    }
    
    @PostMapping(value = "/get-groups-by-employee-id")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getGroupsByEmployeeId(   @RequestBody Map<String, ?> entity,
            @RequestParam Integer pageNum,
            @RequestParam Integer pageSize) {
        new RequestValidator(entity)
            .hasId(Keys.ID, true); // Validate that employeeId is provided

        return groupChatService.getGroupsByEmployeeId(entity, pageNum, pageSize);
    }




    @PostMapping(value = "/send-message")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> sendMessage(@RequestBody Map<String, ?> entity) {
    	
    	new RequestValidator(entity)
    		.hasId(Keys.GROUPID,true)
    		.hasId(Keys.MESSAGEBY,true)
    		.hasString(Keys.MESSAGE)
    		.hasId(Constants.COMPANY_ID, true);
        return groupChatService.sendMessage(entity);
    }

    @PostMapping(value = "/get-messages")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getGroupMessages(
            @RequestBody Map<String, ?> entity,
            @RequestParam Integer pageNum, 
            @RequestParam Integer pageSize) {
    	
    		new RequestValidator(entity)
    			.hasId(Keys.GROUPID,true)
    			.hasId(Keys.ID, true);
        return groupChatService.getGroupMessages(entity, pageNum, pageSize);
    }


}
