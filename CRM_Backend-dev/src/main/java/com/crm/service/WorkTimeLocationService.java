package com.crm.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crm.controller.Keys;
import com.crm.exception.ForBiddenException;
import com.crm.exception.NotFoundException;
import com.crm.model.Employee;
import com.crm.model.Location;
import com.crm.model.WorkTimeLocationLog;
import com.crm.repos.EmployeeRepo;
import com.crm.repos.WorkTimeLocationLogRepository;
import com.crm.utility.Constants;
import com.crm.utility.JwtBasedCurrentUserProvider;

@Service
public class WorkTimeLocationService {

	private static final Logger LOGGER = LogManager.getLogger(WorkTimeLocationService.class);

	@Autowired
	private WorkTimeLocationLogRepository workTimeLocationLogRepository;

	@Autowired
	private LocationService locationService;

	@Autowired
	private EmployeeRepo employeeRepo;
	
	@Autowired
	private NotificationService notificationService;
	
	@Autowired
	private JwtBasedCurrentUserProvider basedCurrentUserProvider;

//	public WorkTimeLocationLog handleLogin(Map<String, ?> request) {
//
//		LOGGER.info("Handling login for Employee ID: {}", request.get("employeeId"));
//
//		Long employeeId = Long.parseLong(request.get("employeeId").toString());
//		Double latitude = Double.parseDouble(request.get("latitude").toString());
//		Double longitude = Double.parseDouble(request.get("longitude").toString());
//
//		Map<String, Object> locationData = Map.of(Constants.FIELD_EMPLOYEE_ID, employeeId, Constants.FIELD_LATITUDE,
//				latitude, Constants.FIELD_LONGITUDE, longitude);
//		Location location = locationService.createOrUpdateLocation(locationData);
//		
//		WorkTimeLocationLog workTimeLocationLog = new WorkTimeLocationLog();
//		workTimeLocationLog.setEmployeeId(employeeId);
//		workTimeLocationLog.setLoginLocationId(location.getId());
//		workTimeLocationLog.setLoginTime(LocalDateTime.now());
//		return workTimeLocationLogRepository.save(workTimeLocationLog);
//
//	}

	public WorkTimeLocationLog handleLogin(Map<String, ?> request) {

		LOGGER.info("Handling login for Employee ID: {}", request.get("employeeId"));

		Long id = Long.parseLong(request.get(Keys.ID).toString());
		Double latitude = Double.parseDouble(request.get(Constants.FIELD_LATITUDE).toString());
		Double longitude = Double.parseDouble(request.get(Constants.FIELD_LONGITUDE).toString());
		Long comapanyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		Optional<Employee> emp = employeeRepo.findById(id);

		if (emp.isPresent()) {

			Employee employee = emp.get();
			Long hrId = employee.getHrId();
			if(hrId!=null)
			{
				Map<String,?>data=Map.of(
				Keys.ID,hrId,Constants.FIELD_NOTIFICATION_TITLE,"employee login",
				Constants.FIELD_NOTIFICATION_TEXT,"employee with id"+id+"is login");
				
				notificationService.createNotification(data);
			}

		}

		Map<String, Object> locationData = Map.of(Constants.FIELD_EMPLOYEE_ID, id, Constants.FIELD_LATITUDE, latitude,
				Constants.FIELD_LONGITUDE, longitude);
		Location location = locationService.createOrUpdateLocation(locationData);

		WorkTimeLocationLog workTimeLocationLog = new WorkTimeLocationLog();
		workTimeLocationLog.setEmployeeId(id);
		workTimeLocationLog.setLoginLocationId(location.getId());
		workTimeLocationLog.setLoginTime(LocalDateTime.now());
		workTimeLocationLog.setCompanyId(comapanyId);
		return workTimeLocationLogRepository.save(workTimeLocationLog);

	}
//	public void handleLogout(Map<String, ?> request) {
//
//		Long employeeId = Long.parseLong(request.get("employeeId").toString());
//		Double latitude = Double.parseDouble(request.get("latitude").toString());
//		Double longitude = Double.parseDouble(request.get("longitude").toString());
//
//		Map<String, Object> locationData = Map.of(Constants.FIELD_EMPLOYEE_ID, employeeId, Constants.FIELD_LATITUDE,
//				latitude, Constants.FIELD_LONGITUDE, longitude);
//		Location location = locationService.createOrUpdateLocation(locationData);
//
//		Optional<WorkTimeLocationLog> optionalWorkTimeLocationLog = workTimeLocationLogRepository
//				.findTopByEmployeeIdOrderByLoginTimeDesc(employeeId);
//
//		if (optionalWorkTimeLocationLog.isPresent()) {
//			WorkTimeLocationLog workTimeLocationLog = optionalWorkTimeLocationLog.get();
//			workTimeLocationLog.setLogoutLocationId(location.getId());
//			workTimeLocationLog.setLogoutTime(LocalDateTime.now());
//			workTimeLocationLogRepository.save(workTimeLocationLog);
//		} else {
//			throw new NotFoundException("No login record found for Employee ID: " + employeeId);
//		}
//
//	}

	public void handleLogout(Map<String, ?> request) {

		Long id = Long.parseLong(request.get(Keys.ID).toString());
		Double latitude = Double.parseDouble(request.get(Constants.FIELD_LATITUDE).toString());
		Double longitude = Double.parseDouble(request.get(Constants.FIELD_LONGITUDE).toString());
		Long companyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		Map<String, Object> locationData = Map.of(Constants.FIELD_EMPLOYEE_ID, id, Constants.FIELD_LATITUDE, latitude,
				Constants.FIELD_LONGITUDE, longitude);
		Location location = locationService.createOrUpdateLocation(locationData);
		
		Optional<WorkTimeLocationLog> optionalWorkTimeLocationLog = workTimeLocationLogRepository
				.findTopByEmployeeIdOrderByLoginTimeDesc(id);

		if (optionalWorkTimeLocationLog.isPresent()) {
			WorkTimeLocationLog workTimeLocationLog = optionalWorkTimeLocationLog.get();
			workTimeLocationLog.setLogoutLocationId(location.getId());
			workTimeLocationLog.setLogoutTime(LocalDateTime.now());
			workTimeLocationLog.setCompanyId(companyId);
			workTimeLocationLogRepository.save(workTimeLocationLog);
		} else {
			throw new NotFoundException("No login record found for Employee ID: " + id);
		}
		Optional<Employee> emp = employeeRepo.findById(id);

		if (emp.isPresent()) {

			Employee employee = emp.get();
			Long hrId = employee.getHrId();
			if(hrId!=null)
			{
				Map<String,?>data=Map.of(
				Keys.ID,hrId,Constants.FIELD_NOTIFICATION_TITLE,"Employee logout",
				Constants.FIELD_NOTIFICATION_TEXT,"Employee with id"+id+"is logout");
				
				notificationService.createNotification(data);
			}

		}
		
	}

	public void markAttendance(Map<String, ?> request) {
		
		Long employeeId = Long.parseLong(request.get(Keys.ID).toString());

		WorkTimeLocationLog log = workTimeLocationLogRepository.findTopByEmployeeIdOrderByLoginTimeDesc(employeeId)
				.orElseThrow(() -> new NotFoundException("No login record found for Employee ID: " + employeeId));

		log.setPresent(true);

		workTimeLocationLogRepository.save(log);
	}
	
	public boolean checkAttendance(Map<String,?>request)
	{
//		
//		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
//		Long requestCompanyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
//		if(companyId!=requestCompanyId)
//		{
//			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
//		}
		
		Long employeeId = Long.parseLong(request.get(Keys.ID).toString());

		WorkTimeLocationLog log = workTimeLocationLogRepository.findTopByEmployeeIdOrderByLoginTimeDesc(employeeId)
				.orElseThrow(() -> new NotFoundException("No login record found for Employee ID: " + employeeId));
		
		return log.isPresent();
	
	}
    public List<Map<String, Object>> getAttendanceHistory(Long employeeId) {
        List<WorkTimeLocationLog> logs = workTimeLocationLogRepository.findByEmployeeIdOrderByLoginTimeDesc(employeeId);

        if (logs.isEmpty()) {
            throw new NotFoundException("No attendance history found for Employee ID: " + employeeId);
        }

        // Convert to response format
        return logs.stream().map(log -> {
            Map<String, Object> record = new HashMap<>();
            record.put("loginTime", log.getLoginTime());
            record.put("logoutTime", log.getLogoutTime());
            record.put("present", log.isPresent());
            record.put("loginLocationId", log.getLoginLocationId());
            record.put("logoutLocationId", log.getLogoutLocationId());
            record.put("companyId", log.getCompanyId());
            return record;
        }).collect(Collectors.toList());
    }


}