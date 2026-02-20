package com.crm.service;

import com.crm.model.Employee;
import com.crm.repos.DailySalaryLogRepository;
import com.crm.repos.EmployeeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@Component
public class MonthlySalaryScheduler {

	@Autowired
	private DailySalaryLogRepository dailySalaryLogRepository;

	@Autowired
	private SalaryService salaryService;

	@Autowired
	private NotificationService notificationService;

	@Autowired
	private EmployeeRepo employeeRepo;

	@Scheduled(cron = "0 0 0 1 * ?") // Runs at midnight on the 1st of every month
	// @Scheduled(cron = "0 */2 * * * ?")
	public void calculateMonthlySalary() {

		YearMonth previousMonth = YearMonth.now().minusMonths(1);

		// Get all distinct employee IDs from the daily salary log
		List<Long> employeeIds = dailySalaryLogRepository.findDistinctEmployeeIds();

		for (Long employeeId : employeeIds) {
			salaryService.calculateAndSaveMonthlySalary(employeeId, previousMonth);
		}
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
					"notificationText", notificationText));
		}
	}

	// @Scheduled(cron = "0 0 0 * * ?") // Runs every day at midnight to check the
	// notification condition
	// public void sendSalaryNotification() {
	// LocalDate today = LocalDate.now();
	// LocalDate lastDayOfMonth = YearMonth.now().atEndOfMonth();
	// LocalDate notificationDay = lastDayOfMonth.minusDays(2); // Two days before
	// salary
	//
	// if (today.equals(notificationDay)) {
	// List<Employee> employees = employeeRepo.findAll(); // Get all employees
	// for (Employee employee : employees) {
	// String notificationTitle = "Salary Reminder";
	// String notificationText = "Your salary for this month will be credited in two
	// days.";
	// notificationService.createNotification(Map.of(
	// "id", employee.getId(),
	// "notificationTitle", notificationTitle,
	// "notificationText", notificationText
	// ));
	// }
	// }
	// }
}
