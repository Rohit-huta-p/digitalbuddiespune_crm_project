package com.crm.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@Entity
@Data
@Table(name = "monthly_salary_log")
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySalaryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "monthly_salary", nullable = false)
    private double monthlySalary;

    @Column(name = "month", nullable = false)
    private String month; // Stores year and month (e.g., 2024-02)
    
    @Column(name="status")
    private boolean status=false;
    
    public void setMonth(YearMonth yearMonth) {
        this.month = yearMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
    }

    public YearMonth getMonth() {
        return YearMonth.parse(this.month, DateTimeFormatter.ofPattern("yyyy-MM"));
    }
}
