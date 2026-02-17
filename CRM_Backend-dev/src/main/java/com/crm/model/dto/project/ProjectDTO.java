package com.crm.model.dto.project;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private String status;
    private Long companyId;
    private Long createdBy;
    private LocalDateTime createdAt;

    // Detailed info
    private Long clientId;
    private String clientName;

    private List<Long> groupLeaderIds;
    private List<ProjectParticipantDTO> participants;
}
