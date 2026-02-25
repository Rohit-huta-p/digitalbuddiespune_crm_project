package com.crm.repos;

import com.crm.model.Task;
import com.crm.model.dto.NotifyDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotifyRepository extends JpaRepository<Task, Long> {

    @Query("SELECT new com.crm.model.dto.NotifyDto(e.id, e.email, t.taskName) " +
            "FROM Task t JOIN t.assignedEmployees e " +
            "WHERE FUNCTION('DATE', t.deadlineTimestamp) = CURDATE()")
    List<NotifyDto> findByDeadlineTimestamp();

}
