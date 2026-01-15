package com.crm.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import com.crm.exception.NotFoundException;
import com.crm.model.Companys;
import com.crm.model.dto.ResponseDTO;
import com.crm.repos.CompanyRepository;
import com.crm.utility.Constants;
import com.crm.utility.RequestValidator;

@Service
public class CompanysService {

	@Autowired
	private CompanyRepository companyRepository;

	public ResponseEntity<ResponseDTO<Map<String, Object>>> addCompany(Map<String, ?> request) {

		String companyName = request.get(Constants.COMPANY_NAME).toString();

		Companys companys = new Companys();
		companys.setCompanyName(companyName);

		companyRepository.save(companys);

		Map<String, Object> responseMap = new HashMap<>();
		responseMap.put("message", "company added succesfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseMap);
		return ResponseEntity.ok(responseDTO);
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllCompanies() {

		List<Companys> companies = companyRepository.findAll();

		if (companies.isEmpty()) {
			throw new NotFoundException("No companies found in the database.");
		}
		Map<String, Object> response = new HashMap<>();
		response.put("companies", companies);
		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(response);

		return ResponseEntity.ok(responseDTO);

	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> getById(@RequestBody Map<String, ?> request) {
		Long companyId = Long.parseLong(request.get(Constants.COMPANY_ID).toString());

		Companys companys = companyRepository.findById(companyId)
				.orElseThrow(() -> new NotFoundException("company not found"));
		Map<String, Object> response = new HashMap<>();
		response.put(Constants.COMPANY_ID, companys.getCompanyId());
		response.put(Constants.COMPANY_NAME, companys.getCompanyName());

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(response);

		return ResponseEntity.ok(responseDTO);

	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> deleteById(@RequestBody Map<String, ?> request) {
		Long companyId = Long.parseLong(request.get(Constants.COMPANY_ID).toString());

		if (companyRepository.existsById(companyId)) {
			companyRepository.deleteById(companyId);
		} else {
			throw new NotFoundException("company not found with id " + companyId);
		}
		Map<String, Object> response = new HashMap<>();
		response.put("message", "company deleted successfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(response);

		return ResponseEntity.ok(responseDTO);

	}

}
