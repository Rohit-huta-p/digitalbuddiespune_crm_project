package com.crm.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "coustomer_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoustomerNotification {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long coustomerNotificationId;
    
    @Column(name = "notification_text")
    private  String notificationText;
    
    @Column(name = "notification_title")
    private String notificationTitle;
    
    @Column(name = "coustomer_id")
    private  Long coustomerId;
    
    @Column(name = "notification_time")
    private LocalDateTime notificationTime;
    
    @Column(name = "is_seen")
    private boolean isSeen = false;
}
