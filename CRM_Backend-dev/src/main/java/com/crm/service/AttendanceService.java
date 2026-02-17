package com.crm.service;

import com.crm.model.Attendance;
import com.crm.repos.AttendanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.crm.exception.DuplicateResourceException;
import com.crm.exception.NotFoundException;
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

        // Check if attendance already exists
        if (repo.findByEmployeeIdAndAttendanceDate(employeeId, today).isPresent()) {
            throw new DuplicateResourceException("Employee has already checked in today.");
        }

        Attendance a = Attendance.builder()
                .employeeId(employeeId)
                .attendanceDate(today)
                .checkIn(LocalDateTime.now())
                .status("IN_PROGRESS")
                .build();

        a.computeTotalMinutes();
        return repo.save(a);
    }

    @Transactional
    public Attendance checkOut(Long employeeId) {
        LocalDate today = LocalDate.now();

        Attendance a = repo.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElseThrow(() -> new NotFoundException("No check-in record found for today. Please check-in first."));

        if (a.getCheckOut() != null) {
            throw new DuplicateResourceException("Employee has already checked out today.");
        }

        a.setCheckOut(LocalDateTime.now());
        a.computeTotalMinutes();
        return repo.save(a);
    }

    public List<Attendance> getRange(Long employeeId, LocalDate from, LocalDate to) {
        return repo.findByEmployeeIdAndAttendanceDateBetween(employeeId, from, to);
    }
}
