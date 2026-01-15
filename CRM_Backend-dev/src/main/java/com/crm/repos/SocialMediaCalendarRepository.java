package com.crm.repos;

import com.crm.model.SocialMediaCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SocialMediaCalendarRepository extends JpaRepository<SocialMediaCalendar, Long> {
    List<SocialMediaCalendar> findByScheduledAtBetween(LocalDateTime from, LocalDateTime to);
    List<SocialMediaCalendar> findByClientId(Long clientId);
    List<SocialMediaCalendar> findByStatus(String status);
}
