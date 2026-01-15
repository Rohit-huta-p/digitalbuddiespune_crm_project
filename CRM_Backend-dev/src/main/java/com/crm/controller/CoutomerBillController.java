package com.crm.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.crm.exception.BadRequestException;
import com.crm.exception.ForBiddenException;
import com.crm.model.CoustomerBill;
import com.crm.model.dto.ResponseDTO;
import com.crm.service.CoustomerBillService;
import com.crm.utility.Constants;
import com.crm.utility.JwtBasedCurrentUserProvider;
import com.crm.utility.RequestValidator;

@RestController
@RequestMapping("/bill")
public class CoutomerBillController {

	@Autowired
	CoustomerBillService coustomerBillService;
	
	@Autowired
	private JwtBasedCurrentUserProvider basedCurrentUserProvider;

	@PostMapping("/createCoustomerBill")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> createCustomerBill(@RequestBody Map<String, ?> request) {
		
		new RequestValidator(request)
		.hasName(Constants.FIELD_CUSTOMER_NAME).hasEmail(Constants.FIELD_BILL_EMAIL)
		.hasPhoneNumber(Keys.MOBILE).hasName(Constants.FIELD_GENERATED_BY)
		.hasString(Constants.FIELD_SERVICE_TITLE).hasString(Constants.FIELD_SERVICE_DESC)
		.hasValidAmount(Constants.FIELD_AMOUNT)
		.hasLong(Constants.COMPANY_ID);

		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		
		
		 Long requestCompanyId = request.get(Constants.COMPANY_ID) != null ? Long.parseLong(request.get(Constants.COMPANY_ID).toString()) : null;
		 
		 if(companyId!=requestCompanyId)
		 {
			 throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		 }
		CompletableFuture.runAsync(() -> coustomerBillService.createAndSendBill(request));
		//coustomerBillService.createAndSendBill(request);
		// Prepare the response
		Map<String, Object> response = Map.of("status", "Customer bill created and sent successfully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(response);
		return ResponseEntity.ok(responseDTO);
	}
	
	@PostMapping("/getAllCoustomerBills")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllBills(
			@RequestParam(name = "pageNum", required = true) Integer pageNum,
			@RequestParam(name = "pageSize", required = true) Integer pageSize,
			@RequestBody Map<String,?>request)
	{
			new RequestValidator(request)
				.hasId(Constants.COMPANY_ID,true);
		return coustomerBillService.getAllBills(pageNum, pageSize,request);
	}
	
	@PostMapping("/deleteCoustomerBill")
	public ResponseEntity<ResponseDTO<Map<String,Object>>> deleteBill(@RequestBody Map<String,?> entity)
	{
		new RequestValidator(entity)
			.hasId(Keys.ID, true)
			.hasId(Constants.COMPANY_ID, true);
		
		coustomerBillService.deleteCoustomerBill(entity);
		
		 Map<String,Object> responseAttributes = new HashMap<>();
	        responseAttributes.put("message","Coustomer Bill Deleted SuccessFully");

	        ResponseDTO<Map<String,Object>> responseDTO = new ResponseDTO<>();
	        responseDTO.setAttributes(responseAttributes);
	        return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/markCoustomerBillStatus")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> markBillStatus(@RequestBody Map<String, ?> entity) {
		new RequestValidator(entity).hasId(Keys.ID, true)
		.hasId(Constants.COMPANY_ID, true);

		coustomerBillService.markBill(entity);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Coustomber Bill Mark SuccessFully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}
	
	@PostMapping("/mailSent")
	public ResponseEntity<ResponseDTO<Map<String,Object>>> mailSent(@RequestBody Map<String,?>request)
	{
		new RequestValidator(request)
			.hasId(Keys.ID,true)
			.hasId(Constants.COMPANY_ID, true);
			
		CompletableFuture.runAsync(() -> coustomerBillService.sentMail(request));
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Coustomber Bill Sent SuccessFully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}
	
	@PostMapping("/getFilteredBills")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getFilteredBills(
	        @RequestParam Integer pageNum,
	        @RequestParam Integer pageSize,
	        @RequestBody(required = false) Map<String, Object> filterMap) {

	    String email = filterMap != null ? (String) filterMap.get("email") : null;
	    String phno = filterMap != null ? (String) filterMap.get("phno") : null;
	    String status = filterMap != null ? (String) filterMap.get("status") : null;
	    Long companyId = null;

	    if (filterMap != null && filterMap.get("companyId") != null) {
	        try {
	            companyId = Long.valueOf(filterMap.get("companyId").toString());
	        } catch (NumberFormatException e) {
	            throw new BadRequestException("Invalid companyId format.");
	        }
	    }

	    return coustomerBillService.getFilteredBills(pageNum, pageSize, email, phno, status, companyId);

	}

	
	
}
