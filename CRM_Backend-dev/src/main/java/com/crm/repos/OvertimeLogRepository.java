package com.crm.repos;

import com.crm.model.OvertimeLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OvertimeLogRepository extends JpaRepository<OvertimeLog, Long> {
    void deleteByEmployeeId(Long employeeId);
}
