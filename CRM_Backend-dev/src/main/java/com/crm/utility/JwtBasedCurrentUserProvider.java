package com.crm.utility;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


@Service
public class JwtBasedCurrentUserProvider {
	
	  
    public Long getCurrentCompanyId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

}
