package com.crm.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ErrorDTO {

    private String id;        
    private String code;     
    private String title;     
    private String message;    

    public void setError(String id, String code, String title, String message) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.message = message;
    }


}
