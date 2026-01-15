package com.crm.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


import java.time.LocalDateTime;

@Data
public class SocialCalendarRequest {

    @NotNull(message = "clientId is required")
    private Long clientId;

    @NotBlank(message = "title is required")
    private String title;

    private String mediaType;
    private String referenceLink;
    private String mediaLink;
    private String colorFormat;

    @NotNull(message = "scheduledAt is required")
    private LocalDateTime scheduledAt;

    private String status;
    private String notes;
}
