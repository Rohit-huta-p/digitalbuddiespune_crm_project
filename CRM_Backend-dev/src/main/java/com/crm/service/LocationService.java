package com.crm.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.crm.exception.NotFoundException;
import com.crm.model.Employee;
import com.crm.model.Location;
import com.crm.repos.EmployeeRepo;
import com.crm.repos.LocationRepository;
import com.crm.utility.Constants;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class LocationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(LocationService.class);

	@Autowired
	LocationRepository locationRepository;

	@Autowired
	EmployeeRepo employeeRepository;

	public Location createOrUpdateLocation(Map<String, ?> entity) {

		Long employeeId = Long.parseLong(entity.get(Constants.FIELD_EMPLOYEE_ID).toString());

		Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
		if (!employeeOpt.isPresent()) {
			throw new NotFoundException("Employee with ID " + employeeId + " not found.");
		}

		Location location = locationRepository.findByEmployeeId(employeeId).orElse(new Location());

		location.setEmployeeId(employeeId);
		location.setLatitude(Double.parseDouble(entity.get(Constants.FIELD_LATITUDE).toString()));
		location.setLongitude(Double.parseDouble(entity.get(Constants.FIELD_LONGITUDE).toString()));

		return locationRepository.save(location);
	}

	public List<Location> getAllLocations() {

		List<Location> locations = locationRepository.findAll();
		if (locations.isEmpty()) {
			throw new NotFoundException("No employees found in the database.");
		}
		return locations;
	}

	public Location getLocationById(Long id) {

		Location location = null;

		location = locationRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Location not found with id: " + id));

		return location;

	}

	public void deleteLocation(Long id) {

		if (locationRepository.existsById(id)) {
			locationRepository.deleteById(id);
		} else {
			throw new NotFoundException("Location not found with id: " + id);
		}

	}
}
