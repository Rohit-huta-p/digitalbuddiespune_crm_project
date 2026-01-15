package com.crm.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "client_details")
public class ClientDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long clientId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phno", unique = true, nullable = false)
    private String phno;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "role", nullable = false)
    private int role;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    // ✅ Deliverable Tracking
    @Column(name = "total_posts")
    private Integer totalPosts = 0;

    @Column(name = "completed_posts")
    private Integer completedPosts = 0;

    @Column(name = "total_videos")
    private Integer totalVideos = 0;

    @Column(name = "completed_videos")
    private Integer completedVideos = 0;

    @Column(name = "total_shoots")
    private Integer totalShoots = 0;

    @Column(name = "completed_shoots")
    private Integer completedShoots = 0;

    // ✅ Work percentage (auto-calculated)
    @Column(name = "work_done_percentage")
    private Double workDonePercentage = 0.0;

    @Column(name = "pending_percentage")
    private Double pendingPercentage = 100.0;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectGroupDetails> projects;

    @PostLoad
    public void calculateProgress() {
        int total = (totalPosts + totalVideos + totalShoots);
        int done = (completedPosts + completedVideos + completedShoots);

        if (total > 0) {
            workDonePercentage = (done * 100.0) / total;
            pendingPercentage = 100.0 - workDonePercentage;
        } else {
            workDonePercentage = 0.0;
            pendingPercentage = 100.0;
        }
    }
}
