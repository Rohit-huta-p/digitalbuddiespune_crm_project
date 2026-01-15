package com.crm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "social_calendar_entry")
public class Social {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    // VIDEO / POST / OTHER
    private String type;

    @Column(name = "video_link", length = 1024)
    private String videoLink;

    @Column(name = "reference_link", length = 1024)
    private String referenceLink;

    @Column(name = "color_hex", length = 16)
    private String colorHex; // like #FF5733 or label

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "notes", length = 2000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private ClientDetails client;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }
}
