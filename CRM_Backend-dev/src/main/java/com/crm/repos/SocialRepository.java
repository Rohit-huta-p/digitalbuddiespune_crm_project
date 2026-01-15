package com.crm.repos;

import com.crm.model.Social;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SocialRepository extends JpaRepository<Social, Long> {

    List<Social> findByScheduledAtBetween(LocalDateTime start, LocalDateTime end);

    List<Social> findByClient_ClientId(Long clientId);
}
