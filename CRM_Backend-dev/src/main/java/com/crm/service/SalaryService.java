package com.crm.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.crm.exception.BadRequestException;
import com.crm.exception.NotFoundException;
import com.crm.model.DailySalaryLog;
import com.crm.model.EmployeeSalary;
import com.crm.model.MonthlySalaryLog;
import com.crm.model.OvertimeLog;
import com.crm.model.WorkTimeLocationLog;
import com.crm.repos.DailySalaryLogRepository;
import com.crm.repos.EmployeeRepo;
import com.crm.repos.EmployeeSalaryRepositary;
import com.crm.repos.MonthlySalaryLogRepository;
import com.crm.repos.OvertimeLogRepository;
import com.crm.repos.WorkTimeLocationLogRepository;
import com.crm.utility.SalaryUtil;

@Service
public class SalaryService {

    @Autowired
    EmployeeSalaryRepositary employeesalaryRepository;

    @Autowired
    EmployeeRepo employeeRepo;

    @Autowired
    private com.crm.repos.BillRepository billRepository;

    @Autowired
    private DailySalaryLogRepository dailySalaryLogRepository;

    @Autowired
    private MonthlySalaryLogRepository monthlySalaryLogRepository;

    public static final Logger LOG = LogManager.getLogger();

    // ---------------- Overloaded Methods ----------------

    // Old method (kept for backward compatibility)
    public double calculateAndLogDailySalary(Long employeeId) {
        Map<String, Object> result = calculateAndLogDailySalary(employeeId, null);
        return (double) result.get("netSalary");
    }

    // New method with Base + Commission model (Overrides "Daily" context but keeps
    // API compatibility)
    public Map<String, Object> calculateAndLogDailySalary(Long employeeId, Double manualTaxPercentage) {

        // 1. Get Employee for 'generatedBy' name
        com.crm.model.Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found for ID: " + employeeId));

        // 2. Get Employee Salary Details
        EmployeeSalary salary = employeesalaryRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new NotFoundException("Salary details not found for ID: " + employeeId));

        // 3. Base Salary
        double baseSalary = salary.getMonthlySalary();

        // 4. Calculate Commission from Bills generated this month
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.withDayOfMonth(1);
        LocalDate endDate = now.withDayOfMonth(now.lengthOfMonth());

        List<com.crm.model.Bill> generatedBills = billRepository.findBillsByGeneratedByAndDateRange(employee.getName(),
                startDate, endDate);

        double totalBillAmount = generatedBills.stream().mapToDouble(com.crm.model.Bill::getBillAmount).sum();
        double commissionEarned = (salary.getCommissionRate() / 100.0) * totalBillAmount;

        double grossSalary = baseSalary + commissionEarned;

        // 5. Tax calculation (manual or default from DB)
        double taxPercentage = (manualTaxPercentage != null)
                ? manualTaxPercentage
                : salary.getTaxPercentage();

        double taxAmount = (taxPercentage / 100) * grossSalary;
        double netSalary = grossSalary - taxAmount;

        // 6. Log it for backward compatibility
        DailySalaryLog dailySalaryLog = new DailySalaryLog();
        dailySalaryLog.setEmployeeId(employeeId);
        dailySalaryLog.setDate(now);
        dailySalaryLog.setDailySalary(netSalary);
        dailySalaryLog.setMinutesWorked(0L); // Deprecated parameter in new CRM flow
        dailySalaryLogRepository.save(dailySalaryLog);

        Map<String, Object> result = new HashMap<>();
        result.put("id", employeeId);
        result.put("baseSalary", baseSalary);
        result.put("commissionEarned", commissionEarned);
        result.put("grossSalary", grossSalary);
        result.put("taxPercentage", taxPercentage);
        result.put("taxAmount", taxAmount);
        result.put("netSalary", netSalary);
        result.put("totalSalary", netSalary); // For backward compatibility with frontend

        return result; // Detailed breakdown Map
    }

    // ---------------- Calculate and Save Monthly Salary ----------------
    public MonthlySalaryLog calculateAndSaveMonthlySalary(Long employeeId, YearMonth month) {
        LocalDate startDate = month.atDay(1);
        LocalDate endDate = month.atEndOfMonth();

        List<DailySalaryLog> salaryLogs = dailySalaryLogRepository.findSalaryBetweenDates(employeeId, startDate,
                endDate);
        double totalSalary = salaryLogs.stream().mapToDouble(DailySalaryLog::getDailySalary).sum();

        double roundedSalary = Math.round(totalSalary * 100.0) / 100.0;

        String monthString = month.toString();
        MonthlySalaryLog salaryLog = monthlySalaryLogRepository.findByEmployeeIdAndMonth(employeeId, monthString)
                .orElse(new MonthlySalaryLog());

        if (salaryLog.getId() == null) {
            salaryLog.setEmployeeId(employeeId);
            salaryLog.setMonth(month);
        }

        salaryLog.setMonthlySalary(roundedSalary);

        return monthlySalaryLogRepository.save(salaryLog);
    }

    // ---------------- Mark Monthly Salary Paid ----------------
    public void markSalaryAsPaid(Long employeeId, String monthString) {
        MonthlySalaryLog salaryLog = monthlySalaryLogRepository
                .findByEmployeeIdAndMonth(employeeId, monthString)
                .orElseGet(() -> {
                    YearMonth month = YearMonth.parse(monthString);
                    return calculateAndSaveMonthlySalary(employeeId, month);
                });

        if (salaryLog.isStatus()) {
            throw new BadRequestException("Salary is already marked as paid.");
        }

        salaryLog.setStatus(true);
        monthlySalaryLogRepository.save(salaryLog);
    }

    // ---------------- Get Monthly Salary Records with Tax ----------------
    public Map<String, Object> getSalaryRecords(Map<String, ?> filters, Integer pageNum, Integer pageSize) {
        Long employeeId = filters.get("id") != null ? Long.parseLong(filters.get("id").toString()) : null;
        String status = filters.get("status") != null ? filters.get("status").toString() : null;

        Boolean statusBoolean = null;
        if (status != null) {
            if (status.equalsIgnoreCase("paid"))
                statusBoolean = true;
            else if (status.equalsIgnoreCase("unpaid"))
                statusBoolean = false;
        }

        Pageable pageable = PageRequest.of(Math.max(0, pageNum - 1), pageSize, Sort.by(Sort.Order.asc("month")));

        Page<MonthlySalaryLog> salaryLogs;
        if (employeeId != null && statusBoolean != null) {
            salaryLogs = monthlySalaryLogRepository.findByEmployeeIdAndStatus(employeeId, statusBoolean, pageable);
        } else if (employeeId != null) {
            salaryLogs = monthlySalaryLogRepository.findByEmployeeId(employeeId, pageable);
        } else if (statusBoolean != null) {
            salaryLogs = monthlySalaryLogRepository.findByStatus(statusBoolean, pageable);
        } else {
            salaryLogs = monthlySalaryLogRepository.findAll(pageable);
        }

        if ((employeeId != null || status != null) && salaryLogs.isEmpty()) {
            throw new NotFoundException("No salary records found.");
        }

        List<Map<String, Object>> salaryLogsList = salaryLogs.stream().map(log -> {
            Map<String, Object> logMap = new HashMap<>();
            logMap.put("employeeId", log.getEmployeeId());

            String employeeName = employeeRepo.findById(log.getEmployeeId())
                    .map(com.crm.model.Employee::getName)
                    .orElse("Unknown Employee");

            logMap.put("employeeName", employeeName);
            logMap.put("month", log.getMonth());
            logMap.put("status", log.isStatus() ? "paid" : "unpaid");

            // Fetch employee tax
            EmployeeSalary empSalary = employeesalaryRepository.findByEmployeeId(log.getEmployeeId())
                    .orElseThrow(() -> new NotFoundException(
                            "Salary details not found for ID: " + log.getEmployeeId()));

            double taxPercentage = empSalary.getTaxPercentage();
            double taxAmount = (taxPercentage / 100) * log.getMonthlySalary();
            double netSalary = log.getMonthlySalary() - taxAmount;

            logMap.put("grossSalary", log.getMonthlySalary());
            logMap.put("taxPercentage", taxPercentage);
            logMap.put("taxAmount", taxAmount);
            logMap.put("netSalary", netSalary);

            return logMap;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("salaryRecords", salaryLogsList);
        response.put("totalRecords", salaryLogs.getTotalElements());
        response.put("totalPages", salaryLogs.getTotalPages());
        response.put("currentPage", pageNum);

        return response;
    }

    // ---------------- Helper: Get Employee Tax Percentage ----------------
    public double getEmployeeTaxPercentage(Long employeeId) {
        EmployeeSalary salary = employeesalaryRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new NotFoundException("Salary details not found for ID: " + employeeId));
        return salary.getTaxPercentage();
    }

}
