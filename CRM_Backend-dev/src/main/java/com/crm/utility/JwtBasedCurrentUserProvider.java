package com.crm.utility;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.crm.model.dto.TokenInfo;

@Service
public class JwtBasedCurrentUserProvider {

    public Long getCurrentCompanyId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            return null; // Handle unauthenticated users
        }
        TokenInfo tokenInfo = (TokenInfo) principal;
        return tokenInfo.getCompanyId();
    }

    public TokenInfo getCurrentTokenInfo() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            return null; // or throw meaningful exception, but null might avoid cast
        }
        return (TokenInfo) principal;
    }

}
