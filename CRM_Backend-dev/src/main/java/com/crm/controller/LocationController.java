package com.crm.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.crm.model.Location;
import com.crm.model.dto.ResponseDTO;
import com.crm.service.LocationService;
import com.crm.utility.Constants;
import com.crm.utility.RequestValidator;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/location")
public class LocationController {

	private static final Logger LOGGER = LoggerFactory.getLogger(LocationController.class);

	@Autowired
	LocationService locationService;

	@PostMapping("/saveLocation")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> saveLocation(@RequestBody Map<String, ?> entity) {

	 

	    new RequestValidator(entity)
	            .hasLong(Constants.FIELD_EMPLOYEE_ID)
	            .hasValidLatitude(Constants.FIELD_LATITUDE)
	            .hasValidLongitude(Constants.FIELD_LONGITUDE);

	    Location savedLocation = locationService.createOrUpdateLocation(entity);

	    Map<String, Object> responseAttributes = new HashMap<>();
	    responseAttributes.put("message", "Location saved successfully");

	    ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
	    responseDTO.setAttributes(responseAttributes);
	    return ResponseEntity.ok(responseDTO);
	}


	@PostMapping("/getAllLocations")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllLocations() {


		List<Location> locations = locationService.getAllLocations();
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("Locations", locations);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/GetById")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getLocationById(@RequestBody Map<String, ?> requestData) {

		LOGGER.info(" getLocationByIdRequest Received");

		new RequestValidator(requestData).hasLong(Keys.ID);
		
		long id = Long.parseLong(requestData.get(Keys.ID).toString());

		Location location = locationService.getLocationById(id);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("location", location);

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
		
	}

	 @PostMapping("/deleteLocation")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> deleteLocation(@RequestBody Map<String, ?> requestData) {

	
		new RequestValidator(requestData).hasLong(Keys.ID);
		
		long id = Long.parseLong(requestData.get(Keys.ID).toString());
		locationService.deleteLocation(id);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Location deleted successfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

}
