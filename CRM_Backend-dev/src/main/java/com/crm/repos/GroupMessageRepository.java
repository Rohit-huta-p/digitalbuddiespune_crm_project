package com.crm.repos;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crm.model.GroupMessage;

@Repository
public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {
    List<GroupMessage> findByGroupChatGroupId(Long groupId);
    Page<GroupMessage> findByGroupChatGroupId(Long groupId, Pageable pageable);
}
