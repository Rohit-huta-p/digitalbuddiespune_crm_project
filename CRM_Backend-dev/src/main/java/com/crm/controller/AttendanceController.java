package com.crm.controller;

import com.crm.model.Attendance;
import com.crm.model.dto.AttendanceDTO;
import com.crm.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService service;

    public AttendanceController(AttendanceService service) {
        this.service = service;
    }

    /**
     * ✅ Mark employee check-in for current day
     * Request: { "employeeId": 101 }
     */
    @PostMapping("/checkin")
    public ResponseEntity<AttendanceDTO> checkIn(@RequestBody Map<String, Object> body) {
        Long employeeId = Long.parseLong(body.get("employeeId").toString());
        Attendance attendance = service.checkIn(employeeId);
        return ResponseEntity.ok(AttendanceDTO.fromEntity(attendance));
    }

    /**
     * ✅ Mark employee check-out for current day
     * Request: { "employeeId": 101 }
     */
    @PostMapping("/checkout")
    public ResponseEntity<AttendanceDTO> checkOut(@RequestBody Map<String, Object> body) {
        Long employeeId = Long.parseLong(body.get("employeeId").toString());
        Attendance attendance = service.checkOut(employeeId);
        return ResponseEntity.ok(AttendanceDTO.fromEntity(attendance));
    }

    /**
     * ✅ Get attendance report for given date range
     * Request: { "employeeId": 101, "from": "2025-11-01", "to": "2025-11-07" }
     */
    @PostMapping("/range")
    public ResponseEntity<List<AttendanceDTO>> getRange(@RequestBody Map<String, Object> body) {
        Long employeeId = Long.parseLong(body.get("employeeId").toString());
        LocalDate from = LocalDate.parse(body.get("from").toString());
        LocalDate to = LocalDate.parse(body.get("to").toString());
        List<Attendance> attendances = service.getRange(employeeId, from, to);
        List<AttendanceDTO> dtos = attendances.stream()
                .map(AttendanceDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
