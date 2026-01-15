package com.crm.model.dto;

import com.crm.model.Attendance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Attendance to avoid Hibernate proxy serialization issues
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceDTO {
    private Long id;
    private Long employeeId;
    private LocalDate attendanceDate;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private Integer totalMinutes;
    private String status;
    private LocalDateTime createdAt;

    /**
     * Convert Attendance entity to DTO
     */
    public static AttendanceDTO fromEntity(Attendance attendance) {
        return AttendanceDTO.builder()
                .id(attendance.getId())
                .employeeId(attendance.getEmployeeId())
                .attendanceDate(attendance.getAttendanceDate())
                .checkIn(attendance.getCheckIn())
                .checkOut(attendance.getCheckOut())
                .totalMinutes(attendance.getTotalMinutes())
                .status(attendance.getStatus())
                .createdAt(attendance.getCreatedAt())
                .build();
    }
}
