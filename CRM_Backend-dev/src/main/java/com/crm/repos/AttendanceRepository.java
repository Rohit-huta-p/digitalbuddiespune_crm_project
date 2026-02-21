// ✅ NEW FILE CREATED
package com.crm.repos;

import com.crm.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);

    List<Attendance> findByEmployeeIdAndAttendanceDateBetween(Long employeeId, LocalDate from, LocalDate to);

    void deleteByEmployee(com.crm.model.Employee employee);
}
