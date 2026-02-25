package com.crm.repos;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crm.model.ProjectGroupDetails;

@Repository
public interface ProjectGroupRepository extends JpaRepository<ProjectGroupDetails, Long> {

	Page<ProjectGroupDetails> findByCompanyId(Long companyId, Pageable pageable);

	Page<ProjectGroupDetails> findByCompanyIdAndStatus(Long companyId, String status, Pageable pageable);

	List<ProjectGroupDetails> findByCompanyId(Long companyId);

	List<ProjectGroupDetails> findByClient_ClientId(Long clientId);

	Page<ProjectGroupDetails> findByClient_ClientIdAndCompanyId(Long clientId, Long companyId, Pageable pageable);
}
