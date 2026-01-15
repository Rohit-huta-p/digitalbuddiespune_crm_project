package com.crm.repos;

import com.crm.model.Task;
import com.crm.model.dto.NotifyDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface NotifyRepository extends JpaRepository<Task,Long>  {

    @Query(value = "SELECT assign_to_employee_id AS id,email AS email,task_name AS taskName FROM task_management WHERE  DATE(deadline_time) = CURDATE()",nativeQuery = true)
    List<NotifyDto> findByDeadlineTimestamp();

}
