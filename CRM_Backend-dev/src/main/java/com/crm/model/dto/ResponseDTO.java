package com.crm.model.dto;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ResponseDTO<T> 
{
    private T attributes;
    private List<ErrorDTO> errors; 

    public ResponseDTO(T attributes) 
    {
        this.attributes = attributes;
        
    }


}
