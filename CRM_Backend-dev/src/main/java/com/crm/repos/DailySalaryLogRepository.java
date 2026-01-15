package com.crm.repos;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.crm.model.DailySalaryLog;

public interface DailySalaryLogRepository extends JpaRepository<DailySalaryLog, Long> {
	  @Query("SELECT d FROM DailySalaryLog d WHERE d.employeeId = :employeeId AND d.date BETWEEN :startDate AND :endDate")
	    List<DailySalaryLog> findSalaryBetweenDates(
	            @Param("employeeId") Long employeeId,
	            @Param("startDate") LocalDate startDate,
	            @Param("endDate") LocalDate endDate);
	  
	  @Query("SELECT DISTINCT d.employeeId FROM DailySalaryLog d")
	  List<Long> findDistinctEmployeeIds();

}
