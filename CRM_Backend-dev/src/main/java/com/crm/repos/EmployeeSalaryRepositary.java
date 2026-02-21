package com.crm.repos;

import com.crm.model.EmployeeSalary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeSalaryRepositary extends JpaRepository<EmployeeSalary, Long> {
	Optional<EmployeeSalary> findByEmployeeId(long employeeId);

	void deleteByEmployeeId(Long employeeId);

}
