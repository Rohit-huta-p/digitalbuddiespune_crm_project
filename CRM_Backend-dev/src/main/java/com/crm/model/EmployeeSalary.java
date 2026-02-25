package com.crm.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Table(name = "employees_salary")
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSalary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hourly_salary", nullable = false)
    private double hourlySalary;

    @Column(name = "employee_id", nullable = false, unique = true)
    private Long employeeId;

    @Column(name = "monthly_salary", nullable = false)
    private double monthlySalary;

    @Column(name = "tax_percentage", nullable = false)
    private double taxPercentage = 0.0;

    @Column(name = "commission_rate", nullable = false)
    private double commissionRate = 0.0;
}
