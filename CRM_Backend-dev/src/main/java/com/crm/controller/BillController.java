
package com.crm.controller;

import com.crm.exception.ForBiddenException;
import com.crm.model.dto.ResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.crm.service.BillService;
import com.crm.utility.Constants;
import com.crm.utility.JwtBasedCurrentUserProvider;
import com.crm.utility.RequestValidator;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/bill")
public class BillController {

	private static final Logger LOGGER = LoggerFactory.getLogger(BillController.class);

	@Autowired
	private BillService billService;
	
	@Autowired
	private JwtBasedCurrentUserProvider basedCurrentUserProvider;

	@PostMapping("/createbill")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> createBill(@RequestBody Map<String, ?> entity) {

		new RequestValidator(entity).hasName(Constants.FIELD_CUSTOMER_NAME).hasEmail(Constants.FIELD_BILL_EMAIL)
				.hasPhoneNumber(Keys.MOBILE).hasName(Constants.FIELD_GENERATED_BY)
				.hasString(Constants.FIELD_SERVICE_TITLE).hasString(Constants.FIELD_SERVICE_DESC)
				.hasValidAmount(Constants.FIELD_AMOUNT)
				.hasLong(Constants.COMPANY_ID);

		Long requestCompanyid=basedCurrentUserProvider.getCurrentCompanyId();
		Long companyId=Long.parseLong(entity.get(Constants.COMPANY_ID).toString());
		if(requestCompanyid!=companyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		CompletableFuture.runAsync(() -> billService.createAndSendBill(entity));
		//billService.createAndSendBill(entity);
		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Bill created and sent successfully!");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);

		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/getAllBills")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllBills(
			@RequestParam(name = "pageNum", required = true) Integer pageNum,
			@RequestParam(name = "pageSize", required = true) Integer pageSize) {

		return billService.getAllBills(pageNum, pageSize);
	}

	@PostMapping("/deleteBill")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> deleteBill(@RequestBody Map<String, ?> entity) {

		new RequestValidator(entity).hasId(Keys.ID, true)
			.hasId(Constants.COMPANY_ID, true);

		billService.deleteBill(entity);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Bill Deleted SuccessFully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/markBillStatus")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> markBillStatus(@RequestBody Map<String, ?> entity) {
		new RequestValidator(entity).hasId(Keys.ID, true)
			.hasId(Constants.COMPANY_ID,true);

		billService.markBill(entity);

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("message", "Bill Mark SuccessFully");

		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

	@PostMapping("/getAllBillsWithFilters")
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllBillsWithFilters(
	        @RequestParam(name = "pageNum", required = true) Integer pageNum,
	        @RequestParam(name = "pageSize", required = true) Integer pageSize,
	        @RequestBody(required = false) Map<String, Object> filterMap) {

	    String email = filterMap != null ? (String) filterMap.get("email") : null;
	    String phno = filterMap != null ? (String) filterMap.get("phno") : null;
	    String status = filterMap != null ? (String) filterMap.get("status") : null;
	    Long companyId = filterMap != null ? (Long) filterMap.get("companyId") : null; // Adding companyId filter
	    
	    return billService.getAllBillsWithFilters(pageNum, pageSize, email, phno, status, companyId); // Passing companyId to service
	}


}
