// ✅ NEW FILE CREATED
package com.crm.repos;

import com.crm.model.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    Optional<Lead> findByPhoneNumber(String phoneNumber);

    void deleteByEmployee(com.crm.model.Employee employee);
}
