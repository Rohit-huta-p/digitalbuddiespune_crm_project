package com.crm.model.dto.project;

import lombok.Data;

@Data
public class ProjectParticipantDTO {
    private Long id;
    private String name;
    private String role;
    private String mobile;
    private String email;
}
