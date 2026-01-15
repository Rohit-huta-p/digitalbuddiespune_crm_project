package com.crm.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crm.model.dto.ResponseDTO;
import com.crm.repos.WorkTimeLocationLogRepository;
import com.crm.repos.EmployeeRepo;
import com.crm.repos.LocationRepository;
import com.crm.model.Employee;
import com.crm.service.Employee_Service;
import com.crm.service.LocationService;
import com.crm.service.SalaryService;
import com.crm.service.WorkTimeLocationService;
import com.crm.utility.Constants;
import com.crm.utility.JwtProvider;
import com.crm.utility.RequestValidator;

@RestController
@RequestMapping("/employee")
public class EmployeeController {

	@Autowired
	Employee_Service emp_Service;

	@Autowired
	LocationRepository locationRepository;

	@Autowired
	WorkTimeLocationLogRepository employeeLogRepo;

	@Autowired
	LocationService locationService;

	@Autowired
	WorkTimeLocationService workTimeLocationService;

	@Autowired
	SalaryService salaryService;

	@Autowired
	EmployeeRepo employeeRepo;

	public static final Logger LOG = LogManager.getLogger();

	@PostMapping("/create")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> createEmployee(@RequestBody Map<String, ?> employeeData) {

		String hrId=employeeData.get(Keys.HRID).toString();
		if(hrId!=null)
		{
			new RequestValidator(employeeData)
				.hasId(Keys.HRID,true);
		}
		new RequestValidator(employeeData).hasName(Keys.NAME).hasEmail(Keys.EMAIL).hasPhoneNumber(Keys.MOBILE)
				.hasIntegerId(Keys.ROLE).hasPassword(Keys.PASSWORD)
				.hasLong(Constants.MONTHLY_SALARY)
				.hasLong(Constants.COMPANY_ID);

		emp_Service.createEmployee(employeeData);
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Employee created successfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);


	}

//	@PostMapping("/update")
//	public ResponseEntity<ResponseDTO<Map<String, Object>>> updateEmployee(@RequestBody Map<String, ?> employeeData) {
//
//		new RequestValidator(employeeData).hasName(Keys.NAME).hasEmail(Keys.EMAIL).hasPhoneNumber(Keys.MOBILE)
//				.hasIntegerId(Keys.ROLE).hasPassword(Keys.PASSWORD).hasId(Keys.ID, true);
//
//		long id = Long.parseLong(employeeData.get(Keys.ID).toString());
//		emp_Service.updateEmployee(id, employeeData);
//
//		Map<String, Object> responseAttributes = new HashMap<>();
//		responseAttributes.put("message", "Employee updated successfully");
//
//		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
//		responseDTO.setAttributes(responseAttributes);
//		return ResponseEntity.ok(responseDTO);
//	}
	
	@PostMapping("/update")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> updateEmployee(@RequestBody Map<String, ?> employeeData) {
	    new RequestValidator(employeeData).hasId(Keys.ID, true)
	    	.hasId(Constants.COMPANY_ID,true);

	    long id = Long.parseLong(employeeData.get(Keys.ID).toString());
	    emp_Service.updateEmployee(id, employeeData);

	    Map<String, Object> responseAttributes = new HashMap<>();
	    responseAttributes.put("message", "Employee updated successfully");

	    ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
	    responseDTO.setAttributes(responseAttributes);
	    return ResponseEntity.ok(responseDTO);
	}


	@PostMapping("/get_employee_by_id")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getEmployee(@RequestBody Map<String, ?> requestData) {

		new RequestValidator(requestData).hasId(Keys.ID, true)
		 .hasId(Constants.COMPANY_ID, true)
		 .hasId(Constants.COMPANY_ID, true);

		long id = Long.parseLong(requestData.get(Keys.ID).toString());
		Long companyId=Long.parseLong(requestData.get(Constants.COMPANY_ID).toString());
		Employee employee = emp_Service.getEmployeeById(id,companyId);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("name", employee.getName());
		responseAttributes.put("phno", employee.getMobile());
		responseAttributes.put("email", employee.getEmail());
		responseAttributes.put("role", employee.getRoleDescription());
		responseAttributes.put("password", employee.getPassword());
		responseAttributes.put("hrId", employee.getHrId());
		responseAttributes.put("employeeId", employee.getEmployeeId());
		responseAttributes.put("companyId", employee.getCompanyId());
		responseAttributes.put("id", employee.getId());
		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/get_employee")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllEmployees(@RequestBody Map<String,?> request) {

		new RequestValidator(request)
			.hasId(Constants.COMPANY_ID,true);
		List<Employee> employees = emp_Service.getAllEmployee(request);
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("employees", employees);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/search")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> searchEmployee(@RequestBody Map<String, ?> searchData) {

		// Validate that either name or phone number is provided
		new RequestValidator(searchData).hasEitherString(Keys.NAME, Keys.MOBILE);

		// Get search data from request
		String name = searchData.get(Keys.NAME) != null ? searchData.get(Keys.NAME).toString() : null;
		String phone = searchData.get(Keys.MOBILE) != null ? searchData.get(Keys.MOBILE).toString() : null;

		// Call service to search employee by name or phone
		List<Map<String, Object>> employees = emp_Service.searchEmployeeByNameOrPhone(name, phone);

		// Prepare response
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("employees", employees);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/delete")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> deleteEmployee(@RequestBody Map<String, ?> requestData) {

		new RequestValidator(requestData).hasLong(Keys.ID)
				.hasId(Constants.COMPANY_ID, true);

		long id = Long.parseLong(requestData.get(Keys.ID).toString());
		Long requestCompanyId=Long.parseLong(requestData.get(Constants.COMPANY_ID).toString());
		emp_Service.deleteEmployee(id,requestCompanyId);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Employee deleted successfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

//	@PostMapping("/login")
//	public ResponseEntity<ResponseDTO<Map<String, Object>>> loginEmployee(@RequestBody Map<String, ?> credentials) {
//
//		String employeeId = credentials.get(Keys.ID).toString();
//		String password = credentials.get(Keys.PASSWORD).toString();
//		Double latitude = Double.parseDouble(credentials.get(Constants.FIELD_LATITUDE).toString());
//		Double longitude = Double.parseDouble(credentials.get(Constants.FIELD_LONGITUDE).toString());
//
//		Map<String, Object> credentialData = Map.of(Constants.FIELD_EMPLOYEE_ID, employeeId, Keys.PASSWORD, password,
//				Constants.FIELD_LATITUDE, latitude, Constants.FIELD_LONGITUDE, longitude);
//
//		new RequestValidator(credentialData).hasValidEmployeeId(Constants.FIELD_EMPLOYEE_ID).hasPassword(Keys.PASSWORD)
//				.hasValidLatitude(Constants.FIELD_LATITUDE).hasValidLongitude(Constants.FIELD_LONGITUDE);
//
//		JwtProvider jwtProvider = new JwtProvider();
//		Employee employee = emp_Service.authenticateEmployee(employeeId, password);
//		String token = jwtProvider.generateToken(employee);
//
//		Map<String, Object> loginRequest = Map.of(Constants.FIELD_EMPLOYEE_ID, employee.getId(),
//				Constants.FIELD_LATITUDE, latitude, Constants.FIELD_LONGITUDE, longitude);
//
//		workTimeLocationService.handleLogin(loginRequest);
//
//		Map<String, Object> responseAttributes = new HashMap<>();
//		responseAttributes.put("token", token);
//		responseAttributes.put("employee_id", employee.getEmployeeId());
//		responseAttributes.put("id", employee.getId());
//		responseAttributes.put("role", employee.getRoleDescription());
//		responseAttributes.put("message", "Login successful");
//
//		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
//		responseDTO.setAttributes(responseAttributes);
//
//		return ResponseEntity.ok(responseDTO);
//	}

	@PostMapping("/login")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> loginEmployee(@RequestBody Map<String, ?> credentials) {

		new RequestValidator(credentials).hasValidEmployeeId(Constants.FIELD_EMPLOYEE_ID).hasPassword(Keys.PASSWORD);

		String employeeId = credentials.get(Constants.FIELD_EMPLOYEE_ID).toString();
		String password = credentials.get(Keys.PASSWORD).toString();

		JwtProvider jwtProvider = new JwtProvider();
		Employee employee = emp_Service.authenticateEmployee(employeeId, password);
		String token = jwtProvider.generateToken(employee);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("token", token);
		responseAttributes.put("employee_id", employee.getEmployeeId());
		responseAttributes.put("id", employee.getId());
		responseAttributes.put("role", employee.getRoleDescription());
		responseAttributes.put("companyId", employee.getCompanyId());
		responseAttributes.put("message", "Login successful");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

//	@PostMapping("/logout")
//	public ResponseEntity<ResponseDTO<Map<String, Object>>> logout(@RequestBody Map<String, ?> request) {
//
//		String employeeId = request.get(Constants.FIELD_EMPLOYEE_ID).toString();
//		Double latitude = Double.parseDouble(request.get(Constants.FIELD_LATITUDE).toString());
//		Double longitude = Double.parseDouble(request.get(Constants.FIELD_LONGITUDE).toString());
//
//		Map<String, Object> validateData = Map.of(Constants.FIELD_EMPLOYEE_ID, employeeId, Constants.FIELD_LATITUDE,
//				latitude, Constants.FIELD_LONGITUDE, longitude);
//
//		new RequestValidator(validateData).hasValidEmployeeId(Constants.FIELD_EMPLOYEE_ID)
//				.hasValidLatitude(Constants.FIELD_LATITUDE).hasValidLongitude(Constants.FIELD_LONGITUDE);
//
//		Employee emp = emp_Service.findEmployeeByEmployeeId(employeeId);
//
//		Map<String, Object> requestData = Map.of(Constants.FIELD_EMPLOYEE_ID, emp.getId(), Constants.FIELD_LATITUDE,
//				latitude, Constants.FIELD_LONGITUDE, longitude);
//
//		workTimeLocationService.handleLogout(requestData);
//		double totalDailySalary = salaryService.calculateAndLogDailySalary(emp.getId());
//
//		Map<String, Object> responseAttributes = new HashMap<>();
//		responseAttributes.put("message", "Logout successful.");
//		// responseAttributes.put("daily_salary", totalDailySalary);
//
//		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
//		responseDTO.setAttributes(responseAttributes);
//		return ResponseEntity.ok(responseDTO);
//	}

	@PostMapping("/logout")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> logout(@RequestBody Map<String, ?> request) {

		new RequestValidator(request).hasValidEmployeeId(Constants.FIELD_EMPLOYEE_ID);

		String employeeId = request.get(Constants.FIELD_EMPLOYEE_ID).toString();

		Employee emp = emp_Service.findEmployeeByEmployeeId(employeeId);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Logout successful.");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);

	}
//
	@PostMapping("/mark-login")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> markLogin(@RequestBody Map<String, ?> request) {
		new RequestValidator(request).hasId(Keys.ID, true).hasValidLatitude(Constants.FIELD_LATITUDE)
				.hasValidLongitude(Constants.FIELD_LONGITUDE)
				.hasId(Constants.COMPANY_ID, true);

		Long id = Long.parseLong(request.get(Keys.ID).toString());
		Double latitude = Double.parseDouble(request.get(Constants.FIELD_LATITUDE).toString());
		Double longitude = Double.parseDouble(request.get(Constants.FIELD_LONGITUDE).toString());
		Long companyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		Map<String, ?> loginRequest = Map.of(Keys.ID, id, Constants.FIELD_LATITUDE, latitude, Constants.FIELD_LONGITUDE,
				longitude,Constants.COMPANY_ID,companyId);

		workTimeLocationService.handleLogin(loginRequest);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Login-Mark successful.");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/mark-logout")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> markLogout(@RequestBody Map<String, ?> request) {
		new RequestValidator(request).hasId(Keys.ID, true).hasValidLatitude(Constants.FIELD_LATITUDE)
				.hasValidLongitude(Constants.FIELD_LONGITUDE)
				.hasId(Constants.COMPANY_ID, true);

		Long id = Long.parseLong(request.get(Keys.ID).toString());
		Double latitude = Double.parseDouble(request.get(Constants.FIELD_LATITUDE).toString());
		Double longitude = Double.parseDouble(request.get(Constants.FIELD_LONGITUDE).toString());
		Long companyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		Map<String, ?> loginRequest = Map.of(Keys.ID, id, Constants.FIELD_LATITUDE, latitude, Constants.FIELD_LONGITUDE,
				longitude,Constants.COMPANY_ID,companyId);

		workTimeLocationService.handleLogout(loginRequest);
		double totalDailySalary = salaryService.calculateAndLogDailySalary(id);
		
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Logout-Mark successful.");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);

	}

	@PostMapping("/mark-attendance")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> markAttendance(@RequestBody Map<String, ?> request) {
		new RequestValidator(request).hasId(Keys.ID, true);
			

		workTimeLocationService.markAttendance(request);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Attendance marked successfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}
	
	@PostMapping("/check-attendance")
	public ResponseEntity<ResponseDTO<Map<String,Object>>> checkAttendance(@RequestBody Map<String,?>request)
	{
		new RequestValidator(request)
			.hasId(Keys.ID, true);
			//.hasId(Constants.COMPANY_ID, true);
		
		boolean isPresent=workTimeLocationService.checkAttendance(request);
		
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("isPresent", isPresent);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

}
