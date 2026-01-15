package com.crm.repos;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.crm.model.CoustomerBill;

@Repository
public interface CoustomerBillRepositary extends JpaRepository<CoustomerBill,Long>{
	@Query("SELECT b FROM CoustomerBill b WHERE MONTH(b.billingDate) = MONTH(CURRENT_DATE) - 1 AND YEAR(b.billingDate) = YEAR(CURRENT_DATE)")
	List<CoustomerBill> findPreviousMonthBills();
	
	@Query("SELECT b FROM CoustomerBill b WHERE " +
		       "(:email IS NULL OR b.email = :email) AND " +
		       "(:phno IS NULL OR b.phno = :phno) AND " +
		       "(:isPending IS NULL OR b.isPending = :isPending) AND " +
		       "(:companyId IS NULL OR b.companyId = :companyId)")
		Page<CoustomerBill> findByFiltersAndCompanyId(
		    @Param("email") String email,
		    @Param("phno") String phno,
		    @Param("isPending") Boolean isPending,
		    @Param("companyId") Long companyId,
		    Pageable pageable
		);
	
	@Query("SELECT b FROM CoustomerBill b WHERE b.dueDate = CURRENT_DATE")
	List<CoustomerBill> findBillsDueToday(LocalDate billDueDate);
	
	 Page<CoustomerBill> findByCompanyId(Long companyId, Pageable pageable);

	


}
