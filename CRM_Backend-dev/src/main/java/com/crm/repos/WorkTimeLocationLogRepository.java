package com.crm.repos;

import com.crm.model.WorkTimeLocationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface WorkTimeLocationLogRepository extends JpaRepository<WorkTimeLocationLog, Long> {
    Optional<WorkTimeLocationLog> findByEmployeeIdAndLogoutTimeNotNull(Long employeeId);
    
    Optional<WorkTimeLocationLog> findTopByEmployeeIdOrderByLoginTimeDesc(Long employeeId);
    List<WorkTimeLocationLog> findByEmployeeIdOrderByLoginTimeDesc(Long employeeId);
}
