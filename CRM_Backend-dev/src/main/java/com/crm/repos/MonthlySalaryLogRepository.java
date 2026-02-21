package com.crm.repos;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.crm.model.MonthlySalaryLog;
import java.time.YearMonth;
import java.util.Optional;
import java.util.List;

public interface MonthlySalaryLogRepository extends JpaRepository<MonthlySalaryLog, Long> {

    @Query("SELECT m FROM MonthlySalaryLog m WHERE m.employeeId = :employeeId AND m.month = :month")
    Optional<MonthlySalaryLog> findByEmployeeIdAndMonth(@Param("employeeId") Long employeeId,
            @Param("month") String month);

    // Method to find salary logs by employeeId with pagination
    Page<MonthlySalaryLog> findByEmployeeId(Long employeeId, Pageable pageable);

    // Method to find salary logs by status with pagination
    Page<MonthlySalaryLog> findByStatus(Boolean status, Pageable pageable);

    // Method to find salary logs by employeeId and status with pagination
    Page<MonthlySalaryLog> findByEmployeeIdAndStatus(Long employeeId, Boolean status, Pageable pageable);

    // List<MonthlySalaryLog> findByMonth(YearMonth month);

    void deleteByEmployeeId(Long employeeId);
}
