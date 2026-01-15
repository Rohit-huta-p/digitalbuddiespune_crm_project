package com.crm.repos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crm.model.OneTimePassword;

@Repository
public interface OtpRepo extends JpaRepository<OneTimePassword, Long>{
	
	 Optional<OneTimePassword> findByEmployeeIdAndOtp(String employeeId, String otp);
	
}
