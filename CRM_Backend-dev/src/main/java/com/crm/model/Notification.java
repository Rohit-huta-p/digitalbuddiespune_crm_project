package com.crm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long notificationId;
    
    @Column(name = "notification_text")
    private  String notificationText;
    
    @Column(name = "notification_title")
    private String notificationTitle;
    
    @Column(name = "employee_id")
    private  Long employeeId;
    
    @Column(name = "notification_time")
    private LocalDateTime notificationTime;
    
    @Column(name = "is_seen")
    private boolean isSeen = false;

}
