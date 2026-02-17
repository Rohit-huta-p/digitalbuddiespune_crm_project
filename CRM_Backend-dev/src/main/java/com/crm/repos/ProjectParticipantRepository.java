package com.crm.repos;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crm.model.Employee;
import com.crm.model.ProjectGroupDetails;
import com.crm.model.ProjectParticipant;

@Repository
public interface ProjectParticipantRepository extends JpaRepository<ProjectParticipant, Long> {

	List<ProjectParticipant> findByProjectGroup(ProjectGroupDetails projectGroup);

	List<ProjectParticipant> findByEmployee(Employee employee);

	void deleteByEmployee(Employee employee);

	boolean existsByProjectGroupAndEmployee(ProjectGroupDetails projectGroup, Employee employee);

	Optional<ProjectParticipant> findByProjectGroupAndEmployee(ProjectGroupDetails projectGroup, Employee employee);
}
