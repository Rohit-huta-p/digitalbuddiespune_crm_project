package com.crm.controller;

import com.crm.model.dto.ResponseDTO;
import com.crm.service.OtpService;
import com.crm.utility.RequestValidator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class OtpController {

	@Autowired
	private OtpService otpService;

	@PostMapping("/forgot-password")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> forgotPassword(@RequestBody Map<String, ?> request) {
		new RequestValidator(request).hasEitherString(Keys.EMAIL, Keys.EMPLOYEE_ID);
		String email = (String) request.get(Keys.EMAIL);
		String employeeId = (String) request.get(Keys.EMPLOYEE_ID);

		// .hasEmail(Keys.EMAIL);
		// .hasValidEmployeeId(Keys.EMPLOYEE_ID);
		String response = otpService.generateOtp(request);
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", response);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/verify-otp")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> verifyOtp(@RequestBody Map<String, ?> request) {
		new RequestValidator(request).hasValidEmployeeId(Keys.EMPLOYEE_ID).hasPassword(Keys.NEW_PASSWORD)
				.hasValidOtp(Keys.OTP);
		String employeeId = (String) request.get(Keys.EMPLOYEE_ID);
		String otp = (String) request.get(Keys.OTP);
		String newPassword = (String) request.get(Keys.NEW_PASSWORD);

		String response = otpService.verifyOtpAndResetPassword(request);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", response);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}
}
