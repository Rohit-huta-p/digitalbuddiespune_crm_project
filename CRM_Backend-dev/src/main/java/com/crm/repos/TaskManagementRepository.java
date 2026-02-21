package com.crm.repos;

import com.crm.model.Location;
import com.crm.model.ProjectGroupDetails;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.crm.model.Task;

import java.util.List;
import java.util.Optional;

public interface TaskManagementRepository extends JpaRepository<Task, Long> {
    @Query("SELECT t FROM Task t JOIN t.assignedEmployees e WHERE e.id = :employeeId")
    List<Task> findByAssignedEmployees_Id(@Param("employeeId") Long employeeId);

    List<Task> findByProjectGroup(ProjectGroupDetails projectGroup);

    Page<Task> findByProjectGroup_ProjectId(Long projectId, Pageable pageable);

    List<Task> findByProjectGroup_ProjectId(Long projectId);

    List<Task> findByProjectGroup_ProjectIdAndAssignedEmployees_Id(Long projectId, Long employeeId);

    List<Task> findByCompanyId(Long companyId);

    Page<Task> findByCompanyId(Long companyId, Pageable pageable);

    Page<Task> findByCompanyIdAndStatus(Long companyId, String status, Pageable pageable);

    Page<Task> findByAssignedEmployees_IdAndProjectGroup_ProjectId(Long employeeId, Long projectId, Pageable pageable);

    List<Task> findByAssignedEmployeesContaining(com.crm.model.Employee employee);
}
