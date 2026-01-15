package com.crm.repos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crm.model.Companys;

public interface CompanyRepository extends JpaRepository<Companys, Long> {
	
	Optional<Companys> findByCompanyId(Long companyId);
}
