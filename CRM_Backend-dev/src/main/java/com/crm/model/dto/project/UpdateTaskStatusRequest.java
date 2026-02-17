package com.crm.model.dto.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTaskStatusRequest {

    @NotNull(message = "Task ID is required")
    private Long taskId;

    @NotBlank(message = "Status cannot be empty")
    private String status;

    // employeeId is usually extracted from token, but might be needed if admin is
    // updating for someone else?
    // In strict REST, the user ID comes from the token.
    // However, existing logic uses employee_id from body. We should transition to
    // Token based.
}
