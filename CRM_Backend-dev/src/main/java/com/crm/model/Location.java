package com.crm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "location")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "id")
    private Long id;
    
    @Column(name = "employee_id", unique = true)
    private Long employeeId;
    @Column(name = "latitude")
    private double latitude;
    @Column(name = "longitude")
    private double longitude;


}
