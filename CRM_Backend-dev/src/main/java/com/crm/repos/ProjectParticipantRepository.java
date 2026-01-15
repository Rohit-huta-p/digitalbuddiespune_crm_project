package com.crm.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crm.model.ProjectGroupDetails;
import com.crm.model.ProjectParticipant;

@Repository
public interface ProjectParticipantRepository extends JpaRepository<ProjectParticipant, Long> {

	  List<ProjectParticipant> findByProjectGroup(ProjectGroupDetails projectGroup);
}
