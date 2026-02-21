package com.crm.repos;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.crm.model.GroupChat;

@Repository
public interface GroupChatRepository extends JpaRepository<GroupChat, Long> {
    List<GroupChat> findByCreatedById(Long createdById);

    // Page<GroupChat> findByCreatedById(Long createdById, Pageable pageable);
    @Query("SELECT g FROM GroupChat g WHERE g.createdById = :createdById AND g.companyId = :companyId")
    Page<GroupChat> findByCreatedByIdAndCompanyId(@Param("createdById") Long createdById,
            @Param("companyId") Long companyId,
            Pageable pageable);

    @Query("SELECT DISTINCT g FROM GroupChat g JOIN g.participants p WHERE p.id = :employeeId")
    Page<GroupChat> findByParticipantsEmployeeId(@Param("employeeId") Long employeeId, Pageable pageable);

    List<GroupChat> findByParticipantsContaining(com.crm.model.Employee employee);
}
