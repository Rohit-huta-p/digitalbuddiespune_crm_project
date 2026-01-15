package com.crm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "follow_up")
public class FollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Lead lead;

    @Column(columnDefinition = "TEXT")
    private String note;

    // PENDING / COMPLETED / MISSED / REMINDER_SENT
    @Column(name = "call_status")
    private String callStatus = "PENDING";

    // ✅ Make sure this exists
    @Column(name = "call_time")
    private LocalDateTime callTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
