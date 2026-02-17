package com.crm.utility;

import java.io.IOException;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.slf4j.MDC;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.crm.controller.Keys;
import com.crm.model.dto.TokenInfo;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private static final Logger LOGGER = LogManager.getLogger();
	private final JwtValidator jwtValidator;

	public JwtAuthenticationFilter(JwtValidator jwtValidator) {
		this.jwtValidator = jwtValidator;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		try {
			String token = getJwtFromRequest(request);

			if (StringUtils.hasText(token)) {
				// Determine if it's a public endpoint is handled in SecurityConfig,
				// but we might want to skip validation if we know it's public to avoid errors?
				// Actually, standard pattern is to attempt auth if token exists.

				// JwtValidator.isTokenValid currently performs validation and returns info
				// It takes request, but we only have token here.
				// The existing isTokenValid method expects request to extract token again...
				// Let's use it as is for now to avoid breaking JwtValidator signature if used
				// elsewhere.

				TokenInfo tokenInfo = jwtValidator.isTokenValid(request);

				if (tokenInfo != null) {
					Long companyId = tokenInfo.getCompanyId();
					Long roleId = tokenInfo.getRole();
					String roleName = mapRole(roleId.intValue());

					// Create Authorities
					// We add ROLE_ prefix for standard Spring Security hasRole() checks
					SimpleGrantedAuthority roleAuthority = new SimpleGrantedAuthority("ROLE_" + roleName);

					UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
							tokenInfo, // Principal is now TokenInfo object
							null, // Credentials
							List.of(roleAuthority) // Authorities
					);

					SecurityContextHolder.getContext().setAuthentication(authentication);
					MDC.put(Keys.USER_ID, String.valueOf(companyId)); // Log context
				}
			}
		} catch (Exception e) {
			LOGGER.error("Cannot set user authentication: {}", e.getMessage());
			// We do NOT fail the request here. We leave SecurityContext empty.
			// SecurityConfig's .authenticated() will handle the rejection if needed.
			SecurityContextHolder.clearContext();
		}

		try {
			filterChain.doFilter(request, response);
		} finally {
			MDC.remove(Keys.USER_ID);
		}
	}

	private String getJwtFromRequest(HttpServletRequest request) {
		String bearerToken = request.getHeader("Authorization");
		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7);
		}
		return null;
	}

	private String mapRole(int roleId) {
		switch (roleId) {
			case 1:
				return "ADMIN";
			case 2:
				return "EXECUTIVE";
			case 3:
				return "EMPLOYEE";
			case 4:
				return "CLIENT";
			default:
				return "UNKNOWN";
		}
	}
}
