package com.crm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "work_time_location_log")	//work time log
public class WorkTimeLocationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "login_location_id", nullable = false)
    private Long loginLocationId;

    @Column(name = "logout_location_id")
    private Long logoutLocationId;

    @Column(name = "login_time", nullable = false)
    private LocalDateTime loginTime;

    @Column(name = "logout_time")
    private LocalDateTime logoutTime;
    
    @Column(name = "isPresent", nullable = false)
    private boolean isPresent=false;
    
    @Column(name = "company_id", nullable = false)
    private Long companyId;

}
