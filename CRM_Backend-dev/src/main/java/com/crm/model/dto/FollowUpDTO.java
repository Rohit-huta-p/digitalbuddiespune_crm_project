package com.crm.model.dto;

import com.crm.model.FollowUp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for FollowUp to avoid Hibernate proxy serialization issues
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowUpDTO {
    private Long id;
    private Long leadId;
    private String note;
    private LocalDateTime callTime;
    private String callStatus;
    private LocalDateTime createdAt;

    /**
     * Convert FollowUp entity to DTO
     */
    public static FollowUpDTO fromEntity(FollowUp followUp) {
        return FollowUpDTO.builder()
                .id(followUp.getId())
                .leadId(followUp.getLead() != null ? followUp.getLead().getId() : null)
                .note(followUp.getNote())
                .callTime(followUp.getCallTime())
                .callStatus(followUp.getCallStatus())
                .createdAt(followUp.getCreatedAt())
                .build();
    }
}
