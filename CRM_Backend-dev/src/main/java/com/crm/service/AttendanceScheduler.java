package com.crm.service;

import com.crm.model.Attendance;
import com.crm.model.Employee;
import com.crm.repos.AttendanceRepository;
import com.crm.repos.EmployeeRepo;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AttendanceScheduler {

    private final AttendanceRepository attendanceRepo;
    private final EmployeeRepo employeeRepo;

    public AttendanceScheduler(AttendanceRepository attendanceRepo, EmployeeRepo employeeRepo) {
        this.attendanceRepo = attendanceRepo;
        this.employeeRepo = employeeRepo;
    }

    /**
     * ✅ Runs daily at 11:55 PM (India time)
     */
    @Scheduled(cron = "0 55 23 * * *", zone = "Asia/Kolkata")
    @Transactional
    public void finalizeDailyAttendance() {
        LocalDate today = LocalDate.now();

        // 1️⃣ Fetch all employees
        List<Employee> allEmployees = employeeRepo.findAll();

        for (Employee emp : allEmployees) {
            Attendance att = attendanceRepo
                    .findByEmployeeIdAndAttendanceDate(emp.getId(), today)
                    .orElse(null);

            if (att == null) {
                // No record => mark as ABSENT
                Attendance absent = new Attendance();
                absent.setEmployeeId(emp.getId());
                absent.setAttendanceDate(today);
                absent.setStatus("ABSENT");
                absent.setCheckIn(null);
                absent.setCheckOut(null);
                absent.setTotalMinutes(0);
                attendanceRepo.save(absent);
            } else if (att.getCheckIn() != null && att.getCheckOut() == null) {
                // Checked in but never checked out => auto-close day
                att.setCheckOut(LocalDateTime.of(today, LocalTime.of(23, 59)));
                att.computeTotalMinutes();
                attendanceRepo.save(att);
            }
        }

        System.out.println("✅ Daily attendance finalized for date: " + today);
    }
}
