package com.crm.utility;

import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;

import com.crm.model.ClientDetails;
import com.crm.model.Employee;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtProvider {
	
    private final String jwtSecretKey = "crm-secret-key-12345678910-crm-secret-key-12345678910";
	
	
    private final long jwtExpirationTime = 1000 * 60 * 60 * 24 ;  // 24 hours
    private final String jwtIssuerClaim = "crmService";

    public String generateToken(Employee employee) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationTime);
        return Jwts.builder()
				.signWith(getSigningKey())
				.issuer(jwtIssuerClaim)
				.issuedAt(new Date())
				.expiration(expiryDate)
				.claim("employeeId", employee.getEmployeeId())
				.claim("id",employee.getId())
				.claim("role", employee.getRole()) 
				.claim("companyId", employee.getCompanyId())
				.compact();
    }
    
    public String generateToken(ClientDetails client) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationTime);
        return Jwts.builder()
				.signWith(getSigningKey())
				.issuer(jwtIssuerClaim)
				.issuedAt(new Date())
				.expiration(expiryDate)
				.claim("clientId", client.getClientId())
				.claim("username", client.getUsername())
				.claim("role", client.getRole())  
				.claim("companyId", client.getCompanyId())
				.compact();
    }

    private SecretKey getSigningKey() {
    	byte[] keyBytes = jwtSecretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
