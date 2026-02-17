package com.crm.model.dto.project;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class TaskDTO {
    private Long id;
    private String name;
    private String description;
    private String status;
    private String priority;
    private LocalDateTime deadline;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;

    private Long assignedBy;
    private List<Long> assignedEmployeeIds;
    private Long projectId;
}
