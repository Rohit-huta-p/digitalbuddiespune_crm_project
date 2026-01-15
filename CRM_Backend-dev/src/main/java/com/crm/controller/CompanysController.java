package com.crm.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crm.model.dto.ResponseDTO;
import com.crm.service.CompanysService;
import com.crm.utility.Constants;
import com.crm.utility.RequestValidator;

@RestController
@RequestMapping("/company")
public class CompanysController {

	@Autowired 
	private CompanysService companysService;
	
	@PostMapping("/addCompany")
	public ResponseEntity<ResponseDTO<Map<String,Object>>> addComapany(@RequestBody Map<String,?> request)
	{
		new RequestValidator(request)
			.hasString(Constants.COMPANY_NAME);
		return companysService.addCompany(request);
	}
	
	@PostMapping("/getAllComapanies")
	public ResponseEntity<ResponseDTO<Map<String,Object>>> addComapany()
	{
		return companysService.getAllCompanies();
	}
	
	@PostMapping("/getById")
	public ResponseEntity<ResponseDTO<Map<String,Object>>>getById(@RequestBody Map<String,?> request)
	{
		new RequestValidator(request)
			.hasId(Constants.COMPANY_ID, true);
		
		return companysService.getById(request);
	}
	
	@PostMapping("/deleteById")
	public ResponseEntity<ResponseDTO<Map<String,Object>>>deleteById(@RequestBody Map<String,?> request)
	{
		new RequestValidator(request)
			.hasId(Constants.COMPANY_ID, true);
		
		return companysService.deleteById(request);
	}
	
}
