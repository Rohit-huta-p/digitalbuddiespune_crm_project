
package com.crm.utility;

import com.crm.model.ChatInfo;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;

public class ObjectParserUtil {
	public static List<Map<String, Object>> parseChats(Page<ChatInfo> chats, Long userId) {
	    return chats.stream().map(chat -> {
	        Map<String, Object> chatMap = new HashMap<>();
	        chatMap.put("userchat_id", chat.getChatId());
	        chatMap.put("chat_name", "Chat with Employee ID " + 
	                (chat.getStartedBy().equals(userId) ? chat.getReceivedBy() : chat.getStartedBy()));
	        chatMap.put("created_at", chat.getCreatedAt());
	        chatMap.put("updated_at", chat.getLastMessageSentOn() != null ? chat.getLastMessageSentOn() : "N/A");
	        return chatMap;
	    }).collect(Collectors.toList());
	}

}
