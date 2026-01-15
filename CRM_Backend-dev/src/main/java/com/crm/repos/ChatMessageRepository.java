package com.crm.repos;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.crm.model.ChatInfo;
import com.crm.model.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {

	@Query("SELECT cm FROM ChatMessage cm WHERE cm.chatInfo.chatId = :chatId ORDER BY cm.createdAt DESC")
	List<ChatMessage> findLatestMessageForChat(@Param("chatId") Integer chatId);

	
	 @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatInfo.chatId = :chatId ORDER BY cm.createdAt DESC")
	    ChatMessage getLatestMessageForChat(@Param("chatId") Integer chatId);
	 
	 @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatInfo.chatId = :chatId ORDER BY cm.createdAt ASC")
	 Page<ChatMessage> getMessagesByChatId(@Param("chatId") Integer chatId, Pageable pageable);
	 
	 @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatInfo.chatId = :chatId ORDER BY cm.createdAt DESC")
	    List<ChatMessage> getMessagesByChatId(@Param("chatId") Integer chatId);

}
	