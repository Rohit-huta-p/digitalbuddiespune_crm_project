package com.crm.model.dto.project;

import lombok.Data;
import java.util.List;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;

@Data
public class AddParticipantRequest {
    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotEmpty(message = "Employee IDs are required")
    private List<Long> employeeIds;
}
