package com.crm.utility;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.crm.model.dto.TokenInfo;

@Service
public class JwtBasedCurrentUserProvider {

    public Long getCurrentCompanyId() {
        TokenInfo tokenInfo = (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return tokenInfo.getCompanyId();
    }

    public TokenInfo getCurrentTokenInfo() {
        return (TokenInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

}
