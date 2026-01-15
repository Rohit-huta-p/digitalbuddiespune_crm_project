package com.crm.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.crm.exception.BadRequestException;
import com.crm.model.MonthlySalaryLog;
import com.crm.service.SalaryService;
import com.crm.utility.RequestValidator;

@RestController
@RequestMapping("/salary")
public class SalaryController {

    private static final Logger LOGGER = LoggerFactory.getLogger(SalaryController.class);

    @Autowired
    SalaryService salaryService;

    /**
     * Calculate daily salary with optional manual tax.
     */
    @PostMapping("/calculateDailySalary")
    public ResponseEntity<Map<String, Object>> calculateSalary(@RequestBody Map<String, ?> request) {

        // Validate request
        new RequestValidator(request).hasId(Keys.ID, true);
        Long id = Long.parseLong(request.get("id").toString());

        // Optional manual tax
        Double manualTaxPercentage = null;
        if(request.containsKey("manualTaxPercentage") && request.get("manualTaxPercentage") != null) {
            manualTaxPercentage = Double.parseDouble(request.get("manualTaxPercentage").toString());
        }

        // Calculate salary and log
        double totalSalary = salaryService.calculateAndLogDailySalary(id, manualTaxPercentage);

        // Fetch tax percentage (manual or default)
        double taxPercentage = (manualTaxPercentage != null) ? manualTaxPercentage : salaryService.getEmployeeTaxPercentage(id);

        // Calculate tax amount applied
        double taxAmount = (taxPercentage / 100) * totalSalary / (1 - taxPercentage / 100);

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("id", id);
        response.put("totalSalary", totalSalary);   // Net salary after tax
        response.put("taxPercentage", taxPercentage);
        response.put("taxAmount", taxAmount);

        return ResponseEntity.ok(response);
    }

    /**
     * Mark salary as paid for a specific month.
     */
    @PostMapping("/markPaid")
    public ResponseEntity<Map<String, Object>> markSalaryAsPaid(@RequestBody Map<String, ?> request) {
        new RequestValidator(request)
                .hasId(Keys.ID, true)
                .hasValidDate("month");

        Long employeeId = Long.parseLong(request.get("id").toString());
        String fullDate = request.get("month").toString();

        LocalDate date = LocalDate.parse(fullDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String yearMonth = date.getYear() + "-" + String.format("%02d", date.getMonthValue());

        salaryService.markSalaryAsPaid(employeeId, yearMonth);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Salary marked as paid successfully.");
        return ResponseEntity.ok(response);
    }

    /**
     * Fetch paginated salary records with optional filters.
     */
    @PostMapping("/getSalaries")
    public ResponseEntity<Map<String, Object>> getSalaryRecords(@RequestBody(required = false) Map<String, ?> filters,
                                                                @RequestParam(name = "pageNum", required = true) Integer pageNum,
                                                                @RequestParam(name = "pageSize", required = true) Integer pageSize) {

        if (filters == null) {
            filters = new HashMap<>();
        }
        new RequestValidator(filters).hasPagination(pageNum, pageSize);

        return ResponseEntity.ok(salaryService.getSalaryRecords(filters, pageNum, pageSize));
    }
}
