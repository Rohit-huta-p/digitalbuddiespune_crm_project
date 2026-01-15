package com.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class DailySalaryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;
    
    @Column(name = "date", nullable = false)
    private LocalDate date;
    
    @Column(name = "daily_salary", nullable = false)
    private double dailySalary;
    
    @Column(name = "minutes_worked", nullable = false)
    private Long minutesWorked;
    
}
