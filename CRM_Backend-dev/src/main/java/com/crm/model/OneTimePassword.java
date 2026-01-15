package com.crm.model;



import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OneTimePassword {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long otpId;
	private String employeeId;
	private String otp;
	
}
