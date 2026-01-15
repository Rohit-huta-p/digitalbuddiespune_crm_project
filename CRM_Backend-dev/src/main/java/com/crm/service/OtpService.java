package com.crm.service;

import com.crm.controller.Keys;
import com.crm.exception.InvalidCredentialsException;
import com.crm.exception.NotFoundException;
import com.crm.model.Employee;
import com.crm.model.OneTimePassword;
import com.crm.repos.EmployeeRepo;
import com.crm.repos.OtpRepo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.CompletableFuture;

@Service
public class OtpService {

	public static final Logger LOG = LogManager.getLogger();

	@Autowired
	private OtpRepo otpRepo;

	@Autowired
	private EmployeeRepo employeeRepo;

	@Autowired
	private EmailService emailService;

	private final Random random = new Random();

	public String generateOtp(Map<String, ?> request) {
     
        String email = (String) request.get(Keys.EMAIL);
        String employeeId = (String) request.get(Keys.EMPLOYEE_ID);

        Employee employee = employeeRepo.findByEmailOrEmployeeId(email, employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        String otpString = Integer.toString(100000 + random.nextInt(900000));

        OneTimePassword otp = new OneTimePassword();
        otp.setEmployeeId(employee.getEmployeeId());
        otp.setOtp(otpString);

        otpRepo.save(otp);

        CompletableFuture.runAsync(() -> emailService.sendOtpEmail(employee.getEmail(), otpString));

        return "OTP sent to your registered email.";
    }

	public String verifyOtpAndResetPassword(Map<String, ?> request) {
        String employeeId = (String) request.get(Keys.EMPLOYEE_ID);
        String otp = (String) request.get(Keys.OTP);
        String newPassword = (String) request.get(Keys.NEW_PASSWORD);

        Optional<OneTimePassword> otpOpt = otpRepo.findByEmployeeIdAndOtp(employeeId, otp);
        if (otpOpt.isEmpty()) {
            throw new InvalidCredentialsException("OTP does not match for employee ID.");
        }

        OneTimePassword storedOtp = otpOpt.get();
        if (!storedOtp.getEmployeeId().equals(employeeId)) {
            throw new InvalidCredentialsException("OTP does not match for employee ID.");
        }

        Optional<Employee> employeeOpt = employeeRepo.findByEmployeeId(employeeId);
        if (employeeOpt.isEmpty()) {
            throw new NotFoundException("Employee not found.");
        }

        Employee employee = employeeOpt.get();
        employee.setPassword(newPassword);
        employeeRepo.save(employee);

        otpRepo.delete(storedOtp);

        return "Password reset successfully.";
    }
}
