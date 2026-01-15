package com.crm.service;

import com.crm.model.Attendance;
import com.crm.repos.AttendanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository repo;

    public AttendanceService(AttendanceRepository repo) {
        this.repo = repo;
    }

 // Corrected checkIn method in AttendanceService.java

    @Transactional
    public Attendance checkIn(Long employeeId) {
        LocalDate today = LocalDate.now();

        Attendance a = repo.findByEmployeeIdAndAttendanceDate(employeeId, today)
            .orElseGet(() -> 
                 // 💥 FIXED: Using the Lombok @Builder pattern instead of setters
                 Attendance.builder()
                    .employeeId(employeeId)
                    .attendanceDate(today)
                    .build()
            );

        a.setCheckIn(LocalDateTime.now());
        a.computeTotalMinutes();
        return repo.save(a);
    }
    

    @Transactional
    public Attendance checkOut(Long employeeId) {
        LocalDate today = LocalDate.now();

        Attendance a = repo.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElseThrow(() -> new IllegalArgumentException("No check-in found for employee today"));

        a.setCheckOut(LocalDateTime.now());
        a.computeTotalMinutes();
        return repo.save(a);
    }

    public List<Attendance> getRange(Long employeeId, LocalDate from, LocalDate to) {
        return repo.findByEmployeeIdAndAttendanceDateBetween(employeeId, from, to);
    }
}
