package com.crm.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "attendance",
        uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "attendance_date"})
)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔹 Link to employee (read-only reference)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore  // ← Prevent Hibernate proxy serialization errors
    private Employee employee;

    // 🔹 Actual persisted foreign key
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "check_in")
    private LocalDateTime checkIn;

    @Column(name = "check_out")
    private LocalDateTime checkOut;

    // 🔹 Total minutes worked between check-in/out
    @Column(name = "total_minutes")
    private Integer totalMinutes;

    // 🔹 PRESENT / LATE / ABSENT / IN_PROGRESS
    @Column(name = "status")
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // 🔹 Compute working time & attendance status
    public void computeTotalMinutes() {
        if (checkIn != null && checkOut != null) {
            long mins = Duration.between(checkIn, checkOut).toMinutes();
            this.totalMinutes = (int) Math.max(0, mins);

            // ✅ Basic working hour logic
            if (this.totalMinutes >= 8 * 60) {
                this.status = "PRESENT";
            } else if (this.totalMinutes >= 4 * 60) {
                this.status = "LATE";
            } else {
                this.status = "HALF_DAY";
            }

        } else if (checkIn != null && checkOut == null) {
            this.status = "IN_PROGRESS";
        } else {
            this.status = "ABSENT";
        }
    }
}
