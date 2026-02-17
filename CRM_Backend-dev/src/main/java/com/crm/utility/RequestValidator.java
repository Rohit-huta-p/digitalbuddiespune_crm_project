
package com.crm.utility;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import com.crm.exception.BadRequestException;
import com.crm.exception.NotFoundException;

public class RequestValidator {

	private Map<String, ?> entity;

	public RequestValidator(Map<String, ?> entity) {
		this.entity = entity;
	}

	private String getStringValue(String key) {
		Object value = entity.get(key);
		return (value instanceof String) ? ((String) value).trim() : null;
	}

	public RequestValidator optional(String key) {
		// Do nothing — just allow optional keys to pass silently.
		return this;
	}

	public RequestValidator hasString(String key) {
		if (getStringValue(key) == null || getStringValue(key).isEmpty())
			throw new BadRequestException(key + " missing!");
		return this;
	}

	public RequestValidator hasEitherString(String key1, String key2) {
		if ((getStringValue(key1) == null || getStringValue(key1).isEmpty())
				&& (getStringValue(key2) == null || getStringValue(key2).isEmpty())) {
			throw new BadRequestException(key1 + " or " + key2 + " both missing!");
		}
		return this;
	}

	public RequestValidator hasName(String key) {
		Object valueObj = entity.get(key);

		if (valueObj == null || !(valueObj instanceof String) || ((String) valueObj).trim().isEmpty()) {
			throw new BadRequestException(key + " missing!");
		}

		String value = ((String) valueObj).trim();
		String nameRegex = "^[A-Za-z]+(\\s[A-Za-z]+)*$";
		Pattern pattern = Pattern.compile(nameRegex);

		if (!pattern.matcher(value).matches()) {
			throw new BadRequestException("Invalid " + key + " value format!");
		}

		return this;
	}

	public RequestValidator hasId(String key, boolean required) {
		Object valueObj = entity.get(key);

		if (valueObj == null || valueObj.toString().trim().isEmpty()) {
			if (required) {
				throw new BadRequestException("Missing required field: " + key);
			}
		} else {
			try {
				Integer.parseInt(valueObj.toString().trim()); // Validate numeric ID
			} catch (NumberFormatException e) {
				throw new BadRequestException("Invalid ID format for field: " + key);
			}
		}
		return this;
	}

	public RequestValidator hasLong(String key) {
		try {
			if (!entity.containsKey(key) || entity.get(key) == null)
				throw new BadRequestException(key + " is missing");
			Long.parseLong(entity.get(key).toString());
		} catch (NumberFormatException e) {
			throw new BadRequestException("Invalid value for " + key + "!");
		} catch (NullPointerException e) {
			throw new BadRequestException(key + " missing!");
		}
		return this;
	}

	public RequestValidator hasValidAmount(String key) {
		if (!entity.containsKey(key) || entity.get(key) == null || entity.get(key).toString().trim().isEmpty()) {
			throw new BadRequestException(key + " is missing!");
		}

		try {
			double amount = Double.parseDouble(entity.get(key).toString().trim());
			if (amount <= 0) {
				throw new BadRequestException("Amount must be greater than zero.");
			}
		} catch (NumberFormatException e) {
			throw new BadRequestException("Invalid amount format! Amount must be a valid decimal number.");
		}

		return this;
	}

	public RequestValidator hasIntegerId(String key) {
		Object value = entity.get(key);
		if (value == null || value.toString().trim().isEmpty()) {
			throw new BadRequestException(key + " missing!");
		}
		try {
			Integer role = Integer.parseInt(value.toString());
			if (role < 1 || role > 3) {
				throw new BadRequestException(
						"Invalid role value! Allowed values: 1 (Admin), 2 (Executive), 3 (Employee)");
			}
		} catch (NumberFormatException e) {
			throw new BadRequestException("Invalid value for " + key + "! Role must be a number (1, 2, or 3)");
		}
		return this;
	}

	public RequestValidator hasEmail(String key) {
		String value = getStringValue(key);
		if (value == null || value.isEmpty())
			throw new BadRequestException("Email missing");
		String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
		if (!Pattern.matches(emailRegex, value))
			throw new BadRequestException("Invalid email format!");
		return this;
	}

	public RequestValidator hasEmail(String key, boolean required) {
		String value = getStringValue(key);

		if (value == null || value.isEmpty()) {
			if (required) {
				throw new BadRequestException("Email missing");
			} else {
				return this; // Skip validation if not required
			}
		}

		String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
		if (!Pattern.matches(emailRegex, value)) {
			throw new BadRequestException("Invalid email format!");
		}

		return this;
	}

	public RequestValidator hasPassword(String key) {
		// Check if the key is present and the value is not null or empty
		if (entity.get(key) == null || entity.get(key).toString().trim().equals("")) {
			throw new BadRequestException("Password missing!");
		}

		String password = entity.get(key).toString().trim();
		String passwordRegex = "^[a-zA-Z0-9@$&]{5,50}$"; // Define password format (alphanumeric + special characters)
		Pattern pattern = Pattern.compile(passwordRegex);
		boolean isValid = pattern.matcher(password).matches();

		if (!isValid) {
			throw new BadRequestException("Invalid password format!");
		}

		return this;
	}

	public RequestValidator hasValidEmployeeId(String key) {
		// Check if the key is present and the value is not null or empty
		if (entity.get(key) == null || entity.get(key).toString().trim().isEmpty()) {
			throw new BadRequestException("Employee ID missing!");
		}

		String empId = entity.get(key).toString().trim();
		String employeeIdRegex = "^EMP\\d{14}\\d+$"; // Matches EMP + 14-digit timestamp + numeric ID

		if (!Pattern.matches(employeeIdRegex, empId)) {
			throw new BadRequestException("Invalid Employee ID format!");
		}

		return this;
	}

	public RequestValidator hasPhoneNumber(String key) {
		String value = getStringValue(key);
		if (value == null || value.isEmpty())
			throw new BadRequestException("Phone number missing");
		String phoneRegex = "^[1-9]\\d{9}$";
		if (!Pattern.matches(phoneRegex, value))
			throw new BadRequestException("Invalid phone number format!");
		return this;
	}

	public RequestValidator hasPagination(Object pageNumObj, Object pageSizeObj) {
		try {
			int pageNum = Integer.parseInt(pageNumObj.toString().trim());
			int pageSize = Integer.parseInt(pageSizeObj.toString().trim());

			if (pageNum < 0) {
				throw new BadRequestException("Invalid page number. It must be a non-negative integer.");
			}

			if (pageSize < 1 || pageSize > 100) { // Example: Limit pageSize to 100
				throw new BadRequestException("Invalid page size. It must be a positive integer between 1 and 100.");
			}
		} catch (NumberFormatException | NullPointerException e) {
			throw new BadRequestException("Page number and size must be valid integers.");
		}

		return this;
	}

	public RequestValidator hasValidDateTime(String key) {
		String value = getStringValue(key);
		if (value == null || value.isEmpty()) {
			throw new BadRequestException("Deadline time missing!");
		}
		try {
			LocalDateTime deadline = LocalDateTime.parse(value, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
			if (deadline.isBefore(LocalDateTime.now())) {
				throw new BadRequestException("Deadline must be a future date-time.");
			}
		} catch (DateTimeParseException e) {
			throw new BadRequestException("Invalid date-time format for field: " + key);
		}
		return this;
	}

	public RequestValidator hasValidLongitude(String key) {
		try {
			double longitude = Double.parseDouble(entity.get(key).toString());
			if (longitude < -180 || longitude > 180)
				throw new BadRequestException("Invalid Longitude! Must be between -180 and 180.");
		} catch (NumberFormatException e) {
			throw new BadRequestException("Longitude must be a valid decimal number!");
		}
		return this;
	}

	public RequestValidator hasValidLatitude(String key) {
		try {
			double latitude = Double.parseDouble(entity.get(key).toString());
			if (latitude < -90 || latitude > 90)
				throw new BadRequestException("Invalid Latitude! Must be between -90 and 90.");
		} catch (NumberFormatException e) {
			throw new BadRequestException("Latitude must be a valid decimal number!");
		}
		return this;
	}

	public RequestValidator hasValidOtp(String key) {
		if (!entity.containsKey(key) || entity.get(key) == null || entity.get(key).toString().trim().isEmpty()) {
			throw new BadRequestException(key + " is missing!");
		}

		String otpString = entity.get(key).toString().trim();

		// ✅ Ensure OTP is exactly 6 digits
		String otpRegex = "^\\d{6}$";
		if (!Pattern.matches(otpRegex, otpString)) {
			throw new BadRequestException("Invalid OTP format! OTP must be a 6-digit number.");
		}

		try {
			Long.parseLong(otpString); // ✅ Ensure OTP is a valid numeric value
		} catch (NumberFormatException e) {
			throw new BadRequestException("OTP must be a valid number.");
		}

		return this;
	}

	public RequestValidator hasValidParticipantIds(String key) {
		Object value = entity.get(key);
		if (value == null || !(value instanceof List)) {
			throw new BadRequestException(key + " missing or invalid format! It should be an array of integers.");
		}

		List<?> list = (List<?>) value;

		if (list.isEmpty()) {
			throw new BadRequestException(key + " cannot be empty.");
		}
		for (Object obj : list) {
			if (!(obj instanceof Integer)) {
				throw new BadRequestException(key + " must be an array of integers.");
			}
			Integer employeeId = (Integer) obj;
			if (employeeId <= 0) {
				throw new BadRequestException("Invalid employee ID in " + key + ": ID must be a positive integer.");
			}
		}

		return this;
	}

	public RequestValidator hasValidTaskStatus(String key) {
		String value = getStringValue(key);

		if (value == null || value.isEmpty()) {
			throw new BadRequestException(key + " is missing!");
		}

		List<String> validStatuses = List.of("open", "closed", "pending", "in-progress", "review");

		if (!validStatuses.contains(value.toLowerCase())) {
			throw new BadRequestException("Invalid " + key + "! Allowed values: open, closed, pending.");
		}

		return this;
	}

	public RequestValidator hasValidPriority(String key) {
		String value = getStringValue(key);

		if (value == null || value.isEmpty()) {
			throw new BadRequestException(key + " is missing!");
		}

		List<String> validPriorities = List.of("high", "medium", "low");

		if (!validPriorities.contains(value.toLowerCase())) {
			throw new BadRequestException("Invalid " + key + "! Allowed values: high, medium, low.");
		}

		return this;
	}

	public RequestValidator hasValidAssignBy(String key) {
		try {
			if (!entity.containsKey(key) || entity.get(key) == null || entity.get(key).toString().trim().isEmpty()) {
				throw new BadRequestException(key + " is missing!");
			}

			// Accept a numeric employee ID (positive long). Detailed role-based
			// permission checks should be performed at the service layer where
			// repositories are available.
			long assignById = Long.parseLong(entity.get(key).toString().trim());

			if (assignById <= 0) {
				throw new BadRequestException("Invalid " + key + "! Must be a positive numeric ID.");
			}
		} catch (NumberFormatException e) {
			throw new BadRequestException("Invalid " + key + "! Must be a numeric value.");
		}

		return this;
	}

	public RequestValidator hasValidGroupLeader(String key) {
		try {
			if (!entity.containsKey(key) || entity.get(key) == null || entity.get(key).toString().trim().isEmpty()) {
				return this; // Allow null or empty value
			}

			// Validate if groupLeader is a valid numeric ID
			Long groupLeaderId = Long.parseLong(entity.get(key).toString().trim());
			if (groupLeaderId <= 0) {
				throw new BadRequestException("Invalid " + key + "! Must be a positive numeric ID.");
			}
		} catch (NumberFormatException e) {
			throw new BadRequestException("Invalid " + key + "! Must be a numeric value.");
		}

		return this;
	}

	public RequestValidator hasValidDate(String key) {
		String value = getStringValue(key);

		if (value == null || value.isEmpty()) {
			throw new BadRequestException(key + " is missing!");
		}
		System.out.println("Received date: " + value); // Debugging line

		try {
			LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE);// Ensures the format is yyyy-MM-dd

		} catch (DateTimeParseException e) {
			throw new BadRequestException("Invalid date format for " + key + "! Use yyyy-MM-dd.");
		}

		return this;
	}

	public RequestValidator hasValidParticipants(String key) {
		Object valueObj = entity.get(key);

		if (!(valueObj instanceof List<?>)) {
			throw new BadRequestException("Participants should be a list!");
		}

		List<?> participants = (List<?>) valueObj;
		List<String> validRoles = Arrays.asList(
				"Frontend_Developer", "Backend_Developer", "Tester",
				"Manager", "Social_Media_Manager", "Video_Editor",
				"Graphic_Designer", "Videography", "Photography");

		for (Object obj : participants) {
			if (!(obj instanceof Map)) {
				throw new BadRequestException("Invalid participant format!");
			}

			Map<?, ?> participant = (Map<?, ?>) obj;

			// Validate ID
			if (!participant.containsKey("id") || participant.get("id") == null) {
				throw new BadRequestException("Participant ID is missing!");
			}

			try {
				Integer.parseInt(participant.get("id").toString());
			} catch (NumberFormatException e) {
				throw new BadRequestException("Invalid participant ID format! Must be an integer.");
			}

			// Validate Role
			if (!participant.containsKey("role") || participant.get("role") == null) {
				throw new BadRequestException("Participant role is missing!");
			}

			String role = participant.get("role").toString();
			if (!validRoles.contains(role)) {
				throw new BadRequestException("Invalid role: " + role + ". Allowed roles: " + validRoles);
			}
		}

		return this;
	}

}
