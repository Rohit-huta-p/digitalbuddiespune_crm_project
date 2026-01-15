package com.crm.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NotifyDto {

    private long id;

    private String email;

    private String taskName;
}
