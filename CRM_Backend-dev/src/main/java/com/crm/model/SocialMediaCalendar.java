package com.crm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "social_media_calendar")
public class SocialMediaCalendar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // optional link to client (if you keep ClientDetails entity)
    @Column(name = "client_id")
    private Long clientId;

    // Title / caption short
    @Column(name = "title", length = 500)
    private String title;

    // Media type: VIDEO / POST / REEL / OTHER
    @Column(name = "media_type", length = 50)
    private String mediaType;

    // Reference link (inspiration / source) - long
    @Column(name = "reference_link", length = 2000)
    private String referenceLink;

    // thumbnail or upload link (optional)
    @Column(name = "media_link", length = 2000)
    private String mediaLink;

    // color(s) - either a single hex or comma separated
    @Column(name = "color_format", length = 200)
    private String colorFormat;

    // scheduled date/time for posting
    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    // status: PENDING / SCHEDULED / POSTED / CANCELLED
    @Column(name = "status", length = 50)
    private String status;

    // who created this (employee id)
    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "notes", length = 2000)
    private String notes;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING";
    }
}
