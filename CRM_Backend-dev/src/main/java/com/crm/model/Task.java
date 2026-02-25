package com.crm.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "task_name")
    private String taskName;

    @Column(name = "description", nullable = true)
    private String description;

    @Column(name = "assigned_time")
    private LocalDateTime assignedTimestamp;

    @Column(name = "deadline_time")
    private LocalDateTime deadlineTimestamp;

    @Column(name = "status")
    private String status; // 1 - open, 2 - closed, 3 - pending

    @Column(name = "assign_by")
    private Long assignedBy;

    @Column(name = "completion_time")
    private LocalDateTime completionTime;
    // new

    @Column(name = "priority", nullable = true)
    private String priority;

    @Column(name = "company_id", nullable = true)
    private Long companyId;

    @ManyToMany()
    private List<Employee> assignedEmployees;
    // new

    @ManyToOne()
    @JoinColumn(name = "project_id", nullable = true)
    private ProjectGroupDetails projectGroup;

    public Task(String taskName, String description, LocalDateTime assignedTimestamp, LocalDateTime deadlineTimestamp,
            int status, Long assignedTo, Long assignedBy) {
    }

    public List<Employee> getAssignedEmployees() {
        return assignedEmployees;
    }

}
