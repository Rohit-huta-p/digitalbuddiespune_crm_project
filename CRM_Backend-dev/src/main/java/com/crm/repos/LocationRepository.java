package com.crm.repos;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crm.model.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {
	
	 Optional<Location> findByEmployeeId(Long employeeId);
}
