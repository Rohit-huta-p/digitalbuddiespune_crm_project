package com.crm.utility;

import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.crm.exception.ForBiddenException;
import com.crm.model.dto.TokenInfo;
import com.crm.repos.ClientDetailsRepository;
import com.crm.repos.EmployeeRepo;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtValidator {

    private static final String JWT_SECRET_KEY = "crm-secret-key-12345678910-crm-secret-key-12345678910";
    private final EmployeeRepo employeeRepository;
    private final ClientDetailsRepository clientDetailsRepository;
    public JwtValidator(EmployeeRepo employeeRepository,ClientDetailsRepository clientDetailsRepository) {
        this.employeeRepository = employeeRepository;
        this.clientDetailsRepository=clientDetailsRepository;
    }

    public Claims parseToken(String token) {
		Claims claims = null;

			try {
				Jws<Claims> signedClaims = Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
				claims = signedClaims.getPayload();
			} catch (Exception e) {
				e.printStackTrace();
				throw new ForBiddenException("Invalid token: JWT signature does not match.");
			}

		return claims;
	}


    private SecretKey getSigningKey() {
        byte[] keyBytes =JWT_SECRET_KEY.getBytes() ;
        return Keys.hmacShaKeyFor(keyBytes);
    }

//    public boolean isTokenValid(HttpServletRequest request) {
//        String token = getJwtFromRequest(request);
//        if (token == null) {
//            throw new ForBiddenException("Missing or invalid token");
//        }
//        try {
//            Claims claims = parseToken(token);
//            String employeeId = claims.get("employeeId", String.class);
//            return employeeRepository.findByEmployeeId(employeeId).isPresent();
//        } catch (Exception e) {
//            throw new ForBiddenException("Invalid token: " + e.getMessage());
//        }
//    }

//    public Long isTokenValid(HttpServletRequest request) {
//        String token = getJwtFromRequest(request);
//        if (token == null) {
//            throw new ForBiddenException("Missing or invalid token");
//        }
//        try {
//            Claims claims = parseToken(token);
//            // Check if it's an employee or client and return the role accordingly
//            if (claims.containsKey("employeeId")) {
//                String employeeId = claims.get("employeeId", String.class);
//                if (!employeeRepository.findByEmployeeId(employeeId).isPresent()) {
//                    throw new ForBiddenException("Invalid employee ID");
//                }
//                return claims.get("role", Long.class); // Return role of employee
//            } else if (claims.containsKey("clientId")) {
//                Long clientId = claims.get("clientId", Long.class);
//                if (!clientDetailsRepository.findById(clientId).isPresent()) {
//                    throw new ForBiddenException("Invalid client ID");
//                }
//                return claims.get("role", Long.class); // Return role of client
//            } else {
//                throw new ForBiddenException("Invalid token: Missing employeeId or clientId");
//            }
//        } catch (Exception e) {
//            throw new ForBiddenException("Invalid token: " + e.getMessage());
//        }
//    }

    public TokenInfo isTokenValid(HttpServletRequest request) {
        String token = getJwtFromRequest(request);
        if (token == null) {
            throw new ForBiddenException("Missing or invalid token");
        }
        try {
            Claims claims = parseToken(token);
            Long companyId;
            Long role;

            // Check if it's an employee or client and retrieve the companyId and role
            if (claims.containsKey("employeeId")) {
                String employeeId = claims.get("employeeId", String.class);
                if (!employeeRepository.findByEmployeeId(employeeId).isPresent()) {
                    throw new ForBiddenException("Invalid employee ID");
                }
                companyId = claims.get("companyId", Long.class);  // Get companyId from token
                role = claims.get("role", Long.class);  // Get role from token
            } else if (claims.containsKey("clientId")) {
                Long clientId = claims.get("clientId", Long.class);
                if (!clientDetailsRepository.findById(clientId).isPresent()) {
                    throw new ForBiddenException("Invalid client ID");
                }
                companyId = claims.get("companyId", Long.class);  // Get companyId from token
                role = claims.get("role", Long.class);  // Get role from token
            } else {
                throw new ForBiddenException("Invalid token: Missing employeeId or clientId");
            }
            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(companyId.toString()));
            Authentication auth = new UsernamePasswordAuthenticationToken(companyId, null, authorities);
			SecurityContextHolder.getContext().setAuthentication(auth);

            return new TokenInfo(companyId, role); // Return both companyId and role
        } catch (Exception e) {
            throw new ForBiddenException("Invalid token: " + e.getMessage());
        }
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
