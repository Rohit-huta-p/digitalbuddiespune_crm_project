package com.crm.repos;

import com.crm.model.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {

    // ✅ Finds all follow-ups that are due soon (for reminders)
    @Query("""
        SELECT f FROM FollowUp f
        WHERE f.callTime BETWEEN :start AND :end
        AND f.callStatus NOT IN ('COMPLETED', 'REMINDER_SENT')
    """)
    List<FollowUp> findDueFollowUps(LocalDateTime start, LocalDateTime end);

    // ✅ Fetch all follow-ups for a given lead (for history)
    List<FollowUp> findByLeadIdOrderByCreatedAtDesc(Long leadId);
}
