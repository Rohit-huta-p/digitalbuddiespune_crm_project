package com.crm.repos;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crm.model.ClientDetails;

@Repository
public interface ClientDetailsRepository extends JpaRepository<ClientDetails, Long> {
	
	Optional<ClientDetails> findByUsername(String username);
	
	ClientDetails findByEmail(String email);
	
	List<ClientDetails> findByCompanyId(Long companyId);

}
