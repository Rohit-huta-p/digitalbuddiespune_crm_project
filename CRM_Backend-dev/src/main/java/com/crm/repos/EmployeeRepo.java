package com.crm.repos;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crm.model.Employee;

@Repository
public interface EmployeeRepo extends JpaRepository<Employee, Long>{
	Optional<Employee> findByEmployeeId(String employeeId);
	  Optional<Employee> findByEmail(String email);
	  Optional<Employee>findByEmailOrEmployeeId(String email,String employeeId);
	  boolean existsByEmployeeId(String employeeId);
	  
	// Find by name (case-insensitive partial match)
	    List<Employee> findByNameContainingIgnoreCase(String name);

	    List<Employee> findByMobile(String phone);
	    
	    List<Employee> findByCompanyId(Long companyId);
}
