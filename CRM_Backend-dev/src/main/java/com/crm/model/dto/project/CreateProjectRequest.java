package com.crm.model.dto.project;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    private String projectName;

    @NotBlank(message = "Project description is required")
    private String projectDesc;

    @NotNull(message = "Created by ID is required")
    private Long createdById;

    private Long clientId;

    @NotEmpty(message = "Project must have at least one group leader")
    private List<Long> groupLeaderIds;

    @Valid
    @NotEmpty(message = "Project must have participants")
    private List<ParticipantRequest> participants;

    @Data
    public static class ParticipantRequest {
        @NotNull(message = "Employee ID is required")
        private Long id;

        @NotBlank(message = "Role is required")
        private String role;
    }
}
