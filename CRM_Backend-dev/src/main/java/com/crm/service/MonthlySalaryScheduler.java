package com.crm.service;

import com.crm.model.DailySalaryLog;
import com.crm.model.Employee;
import com.crm.model.MonthlySalaryLog;
import com.crm.repos.DailySalaryLogRepository;
import com.crm.repos.EmployeeRepo;
import com.crm.repos.MonthlySalaryLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Component
public class MonthlySalaryScheduler {

	@Autowired
	private DailySalaryLogRepository dailySalaryLogRepository;

	@Autowired
	private MonthlySalaryLogRepository monthlySalaryLogRepository;
	
	@Autowired
	private NotificationService notificationService;
	
	@Autowired
	private EmployeeRepo employeeRepo;

	@Scheduled(cron = "0 0 0 1 * ?") // Runs at midnight on the 1st of every month
	// @Scheduled(cron = "0 */2 * * * ?")
	public void calculateMonthlySalary() {

		YearMonth previousMonth = YearMonth.now().minusMonths(1);
		LocalDate startDate = previousMonth.atDay(1); // 1st day of the previous month
		LocalDate endDate = previousMonth.atEndOfMonth(); // Last day of the previous month

		// Get all distinct employee IDs from the daily salary log
//		List<Long> employeeIds = dailySalaryLogRepository.findAll().stream().map(DailySalaryLog::getEmployeeId)
//				.distinct().toList();
		List<Long> employeeIds = dailySalaryLogRepository.findDistinctEmployeeIds();


		for (Long employeeId : employeeIds) {
			double totalSalary = calculateSalaryForEmployee(employeeId, startDate, endDate);

			// Store the calculated salary in MonthlySalaryLog
			saveMonthlySalary(employeeId, totalSalary, previousMonth);
		}
	}

	private double calculateSalaryForEmployee(Long employeeId, LocalDate startDate, LocalDate endDate) {
		List<DailySalaryLog> salaryLogs = dailySalaryLogRepository.findSalaryBetweenDates(employeeId, startDate,
				endDate);
		return salaryLogs.stream().mapToDouble(DailySalaryLog::getDailySalary).sum();
	}

	private void saveMonthlySalary(Long employeeId, double totalSalary, YearMonth month) {
		String monthString = month.format(DateTimeFormatter.ofPattern("yyyy-MM"));
	    double roundedSalary = Math.round(totalSalary * 100.0) / 100.0; 
		monthlySalaryLogRepository.findByEmployeeIdAndMonth(employeeId, monthString)
				.ifPresentOrElse(existingSalaryLog -> {
					existingSalaryLog.setMonthlySalary(roundedSalary); // Update existing salary
					existingSalaryLog.setMonth(month);
					monthlySalaryLogRepository.save(existingSalaryLog);
				}, () -> {
					// Create new monthly salary log
					MonthlySalaryLog newSalaryLog = new MonthlySalaryLog();
					newSalaryLog.setEmployeeId(employeeId);
					newSalaryLog.setMonthlySalary(roundedSalary);
					newSalaryLog.setMonth(month);
					monthlySalaryLogRepository.save(newSalaryLog);
				});
	}
	
	 @Scheduled(cron = "0 0 0 28 * ?") // Runs at midnight on the 29th of every month
	    public void sendSalaryNotification() {
	        List<Employee> employees = employeeRepo.findAll(); // Get all employees
	        for (Employee employee : employees) {
	            String notificationTitle = "Salary Reminder";
	            String notificationText = "Your salary for this month will be credited in two or three days.";
	            notificationService.createNotification(Map.of(
	                "id", employee.getId(),
	                "notificationTitle", notificationTitle,
	                "notificationText", notificationText
	            ));
	        }
	    }
	 
//	 @Scheduled(cron = "0 0 0 * * ?") // Runs every day at midnight to check the notification condition
//	    public void sendSalaryNotification() {
//	        LocalDate today = LocalDate.now();
//	        LocalDate lastDayOfMonth = YearMonth.now().atEndOfMonth();
//	        LocalDate notificationDay = lastDayOfMonth.minusDays(2); // Two days before salary
//
//	        if (today.equals(notificationDay)) {
//	            List<Employee> employees = employeeRepo.findAll(); // Get all employees
//	            for (Employee employee : employees) {
//	                String notificationTitle = "Salary Reminder";
//	                String notificationText = "Your salary for this month will be credited in two days.";
//	                notificationService.createNotification(Map.of(
//	                    "id", employee.getId(),
//	                    "notificationTitle", notificationTitle,
//	                    "notificationText", notificationText
//	                ));
//	            }
//	        }
//	    }
}
