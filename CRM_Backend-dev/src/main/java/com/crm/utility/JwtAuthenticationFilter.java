//package com.crm.utility;
//
//import java.io.IOException;
//
//import org.apache.logging.log4j.LogManager;
//import org.apache.logging.log4j.Logger;
//import org.slf4j.MDC;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import com.crm.controller.Keys;
//import com.crm.exception.ForBiddenException;
//
//import io.jsonwebtoken.Claims;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//
//@Component
//public class JwtAuthenticationFilter extends OncePerRequestFilter {
//
//	private static final Logger LOGGER = LogManager.getLogger();
//	private JwtValidator jwtValidator;
//	private Claims claims;
//
//	public JwtAuthenticationFilter(JwtValidator jwtValidator) {
//		this.jwtValidator = jwtValidator;
//	}
//
//	@Override
//	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//			throws ServletException, IOException {
//
//		long startTime = System.currentTimeMillis();
//
//		if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
//			filterChain.doFilter(request, response);
//			return;
//		}
//
//		if (isEmployeeEndpoint(request.getRequestURI())) {
//			try {
//
//				if (!jwtValidator.isTokenValid(request)) {
//
//					throw new ForBiddenException("Add Authorization Header");
//				}
//
//				// Extract role from token
//				String token = request.getHeader("Authorization");
//
//				if (token == null || !token.startsWith("Bearer ")) {
//					throw new ForBiddenException("Invalid Authorization Header");
//				}
//				token = token.substring(7);
//				claims = jwtValidator.parseToken(token);
//				int roleId = claims.get("role", Integer.class);
//				String role = mapRole(roleId);
//
//				if (!hasAccess(role, request.getRequestURI())) {
//					throw new ForBiddenException("Access denied for role: " + role);
//				}
//
//			} catch (Exception e) {
//				response.setStatus(HttpServletResponse.SC_FORBIDDEN);
//				response.setContentType("application/json");
//				response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
//				response.getWriter().flush();
//				return;
//			}
//		}
//
//		try {
//			filterChain.doFilter(request, response);
//		} finally {
//			long processTime = System.currentTimeMillis() - startTime;
//
//			MDC.remove(Keys.USER_ID);
//
//		}
//	}
//
//	private boolean isEmployeeEndpoint(String uri) {
//		return uri.startsWith("/employee/create") || uri.startsWith("/employee/update/")
//				|| uri.startsWith("/employee/get_employee_by_id/") || uri.startsWith("/employee/get_employee")
//				|| uri.startsWith("/employee/delete/") ||
//
//				uri.startsWith("/bill/createbill/") || uri.startsWith("/bill/createCoustomerBill")
//				|| uri.startsWith("/bill/deleteBill") || uri.startsWith("/bill/deleteCoustomerBill")
//				|| uri.startsWith("/bill/markBillStatus") || uri.startsWith("/bill/markCoustomerBillStatus")
//				|| uri.startsWith("/bill/mailSent")
//
//				|| uri.startsWith("/secured/user/chat/start-chat") || uri.startsWith("/secured/user/chat/send-messages")
//				|| uri.startsWith("/secured/user/chat/get-chats") || uri.startsWith("/secured/user/chat/get-messages")
//
//				|| uri.startsWith("/location/saveLocation") || uri.startsWith("/location/getAllLocations")
//				|| uri.startsWith("/location/GetById/") || uri.startsWith("/location/deleteLocation/") ||
//
//				uri.startsWith("/task/createTask") || uri.startsWith("/task/getAll") || uri.startsWith("/task/update/")
//				|| uri.startsWith("/task/delete/") || uri.startsWith("/task/createGroupTask")
//				|| uri.startsWith("/task/updateGroupTask") ||
//
//				uri.startsWith("/project/group-create") || uri.startsWith("/project/task/schedule")
//				|| uri.startsWith("/project/update") || uri.startsWith("/project/delete")
//				|| uri.startsWith("/project/task/delete") || uri.startsWith("/project/get-project-by-id")
//				|| uri.startsWith("/project/assignTaskToYourself")
//				|| uri.startsWith("/project/getTaskEmployeeByProjectId") || uri.startsWith("/project/markProjectStatus")
//
//				|| uri.startsWith("/salary/convert/") || uri.startsWith("/secured/user/group-chat/get-group-by-id")
//				|| uri.startsWith("/secured/user/group-chat/create")
//				|| uri.startsWith("/secured/user/group-chat/send-message")
//				|| uri.startsWith("/secured/user/group-chat/get-groups/");
//
//	}
//
//	private String mapRole(int roleId) {
//		switch (roleId) {
//		case 1:
//			return "ADMIN";
//		case 2:
//			return "EXECUTIVE";
//		case 3:
//			return "EMPLOYEE";
//		case 4:
//			return "CLIENT";
//		default:
//			return "UNKNOWN";
//		}
//	}
//
//	private boolean hasAccess(String role, String uri) {
//
//		Long employeeIdFromToken = claims.get("id", Long.class);
//
//		if ("ADMIN".equalsIgnoreCase(role)) {
//			return true;
//		} else if ("EXECUTIVE".equalsIgnoreCase(role)) {
//
//			if (uri.startsWith("/employee/delete/") || uri.startsWith("/task/delete/")
//					|| uri.startsWith("/location/deleteLocation/")) {
//				return false;
//			}
//			return true;
//		} else if ("EMPLOYEE".equalsIgnoreCase(role)) {
//			if (uri.startsWith("/employee/update/")) {
//				String[] parts = uri.split("/");
//				String employeeIdFromRequest = parts[parts.length - 1];
//
//				try {
//					Long employeeIdLongFromRequest = Long.parseLong(employeeIdFromRequest);
//					return employeeIdFromToken != null && employeeIdFromToken.equals(employeeIdLongFromRequest);
//				} catch (NumberFormatException e) {
//					return false;
//				}
//			}
//
//			if (uri.startsWith("task/createGroupTask") || uri.startsWith("/task/updateGroupTask")) {
//				return true;
//			}
//		} else if ("CLIENT".equalsIgnoreCase(role)) {
//
////			if (uri.startsWith("/employee/delete/") || uri.startsWith("/task/delete/")
////					|| uri.startsWith("/location/deleteLocation/")) {
////				return false;
////			}
//			return true;
//		}
//
//		return false;
//	}
//
//}

package com.crm.utility;

import java.io.IOException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.crm.controller.Keys;
import com.crm.exception.ForBiddenException;
import com.crm.model.dto.TokenInfo;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private static final Logger LOGGER = LogManager.getLogger();
	private JwtValidator jwtValidator;
	private Claims claims;

	public JwtAuthenticationFilter(JwtValidator jwtValidator) {
		this.jwtValidator = jwtValidator;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		long startTime = System.currentTimeMillis();
		String uri = request.getRequestURI();
		if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
			filterChain.doFilter(request, response);
			return;
		}

		if (isPublicEndpoint(uri)) {
			filterChain.doFilter(request, response);
			return;
		}
		try {

			TokenInfo tokenInfo = jwtValidator.isTokenValid(request);
			Long companyId = tokenInfo.getCompanyId();
			Long roleId = tokenInfo.getRole();
			int roleInt = roleId.intValue();
			String role = mapRole(roleInt);

			switch (role) {
			case "ADMIN":
				
				break;
			case "EXECUTIVE":
				if (!isExecutiveEndpoint(uri)) {
					throw new ForBiddenException("Access denied for EXECUTIVE role.");
				}
				break;
			case "EMPLOYEE":
				if (!isEmployeeEndpoint(uri)) {
					throw new ForBiddenException("Access denied for EMPLOYEE role.");
				}
				break;
			case "CLIENT":
				if (!isClientEndpoint(uri)) {
					throw new ForBiddenException("Access denied for CLIENT role.");
				}
				break;
			default:
				throw new ForBiddenException("Unknown role: Access denied.");

			}

		} catch (Exception e) {
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			response.setContentType("application/json");
			response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
			response.getWriter().flush();
			return;
		}

		try {
			filterChain.doFilter(request, response);
		} finally {
			long processTime = System.currentTimeMillis() - startTime;
			LOGGER.info("request process time "+ processTime);
			MDC.remove(Keys.USER_ID);

		}
	}

	private boolean isPublicEndpoint(String uri) {
		return uri.startsWith("/employee/login") || uri.startsWith("/employee/logout")
				|| uri.startsWith("/client/login") || uri.startsWith("/client/logout")
				||uri.startsWith("/employee/mark-attendance")||uri.startsWith("/employee/mark-login")
				||uri.startsWith("/employee/mark-logout")||uri.startsWith("/employee/check-attendance")
				||uri.startsWith("/employee/search");
	}

	private boolean isEmployeeEndpoint(String uri) {

		return uri.startsWith("/employee/update") || uri.startsWith("/employee/get_employee_by_id")
				||uri.startsWith("/task/getByEmployeeId")||uri.startsWith("/task/assignTaskToSelf")
				||uri.startsWith("/project/getTaskEmployeeByProjectId")||uri.startsWith("/project/get-tasks")
				||uri.startsWith("/employee/get_employee")||uri.startsWith("/task/getAll")||uri.startsWith("/project/get-all-projects")
				||uri.startsWith("/project/get-project-by-id");

	}

	private boolean isAdminEndpoint(String uri) {

		return true;
	}

	private boolean isExecutiveEndpoint(String uri) {

		if (uri.startsWith("/employee/delete/") || uri.startsWith("/task/delete/")
				|| uri.startsWith("/location/deleteLocation/")) {
			return false;
		}

		return true;
	}

	private boolean isClientEndpoint(String uri) {

		return uri.startsWith("/client/get-projects");
				
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
