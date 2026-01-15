package com.crm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "overtime_log")
public class OvertimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "overtime_hours", nullable = false)
    private double overtimeHours;

}
