package com.crm.repos;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.crm.model.ChatInfo;

@Repository
public interface ChatInfoRepository extends JpaRepository<ChatInfo, Integer> {

	@Query("SELECT c FROM ChatInfo c WHERE (c.startedBy = :user1 AND c.receivedBy = :user2) "
			+ "OR (c.startedBy = :user2 AND c.receivedBy = :user1)")
	Optional<ChatInfo> findChatByUserIds(@Param("user1") Long user1, @Param("user2") Long user2);

	@Query("SELECT c FROM ChatInfo c WHERE (c.startedBy = :userId OR c.receivedBy = :userId)")
	Page<ChatInfo> findChatsByUserId(@Param("userId") Long userId, Pageable pageable);
}
