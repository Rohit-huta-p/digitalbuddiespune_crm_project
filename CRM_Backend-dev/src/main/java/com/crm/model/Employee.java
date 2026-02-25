package com.crm.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "employee")
@Component
@Data
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;

    @Column(name = "employee_id", unique = true, nullable = false)
    private String employeeId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "mobile", unique = true, length = 10)
    private String mobile;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "role", nullable = false)
    private int role;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "designation", nullable = false)
    private String designation;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    // new
    @ManyToMany(mappedBy = "assignedEmployees")
    @JsonIgnore
    private List<Task> tasks;
    // new

    // @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval =
    // true)
    // @JsonIgnore
    // private List<ProjectParticipant> projectParticipations;

    @Column(name = "hr_Id", nullable = true, unique = false)
    private Long hrId;

    public Employee() {
        super();
        this.employeeId = generateEmployeeId(id);
    }

    public Employee(long id, String name, String mobile, String email, int role, String password, String designation) {
        super();
        this.id = id;
        this.employeeId = generateEmployeeId(id);
        this.name = name;
        this.mobile = mobile;
        this.email = email;
        this.role = role;
        this.password = password;
        this.designation = designation;
    }

    private String generateEmployeeId(long id) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        return "EMP" + timestamp + id;
    }

    @JsonProperty("roleDescription")
    public String getRoleDescription() {
        switch (this.role) {
            case 1:
                return "Admin";
            case 2:
                return "Hr";
            case 3:
                return "Employee";
            default:
                return "Unknown";
        }
    }
}
