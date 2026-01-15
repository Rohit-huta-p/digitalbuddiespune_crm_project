package com.crm.model.dto;

import com.crm.model.Lead;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Data Transfer Object for Lead to avoid Hibernate proxy serialization issues
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadDTO {
    private Long id;
    private String name;
    private String phoneNumber;
    private String business;
    private String status;
    private Long employeeId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<FollowUpDTO> followUps;

    /**
     * Convert Lead entity to DTO
     */
    public static LeadDTO fromEntity(Lead lead) {
        return LeadDTO.builder()
                .id(lead.getId())
                .name(lead.getName())
                .phoneNumber(lead.getPhoneNumber())
                .business(lead.getBusiness())
                .status(lead.getStatus())
                .employeeId(lead.getEmployee() != null ? lead.getEmployee().getId() : null)
                .createdAt(lead.getCreatedAt())
                .updatedAt(lead.getUpdatedAt())
                .followUps(lead.getFollowUps() != null ? 
                    lead.getFollowUps().stream()
                        .map(FollowUpDTO::fromEntity)
                        .collect(Collectors.toList()) : null)
                .build();
    }
}
