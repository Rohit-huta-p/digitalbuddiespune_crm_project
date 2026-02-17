package com.crm.model.dto.project;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTaskRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Task Name is required")
    private String taskName;

    private String description;

    @NotNull(message = "Deadline is required")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime deadlineTimestamp;

    private String priority; // e.g., "High", "Medium", "Low"

    private List<Long> assignedEmployeeIds;
}
