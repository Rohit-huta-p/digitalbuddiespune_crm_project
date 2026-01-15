package com.crm.service;

import java.io.File;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.crm.controller.Keys;
import com.crm.exception.ForBiddenException;
import com.crm.exception.NotFoundException;
import com.crm.model.Bill;
import com.crm.model.ClientDetails;
import com.crm.model.CoustomerBill;
import com.crm.model.dto.ResponseDTO;
import com.crm.repos.ClientDetailsRepository;
import com.crm.repos.CoustomerBillRepositary;
import com.crm.utility.Constants;
import com.crm.utility.JwtBasedCurrentUserProvider;

@Service
public class CoustomerBillService {

	private static final Logger LOGGER = LoggerFactory.getLogger(CoustomerBillService.class);
	@Autowired
	private CoustomerBillRepositary coustomerBillRepository;

	@Autowired
	private PdfService pdfService;

	@Autowired
	private BillService billService;

	@Autowired
	private EmailService emailService;
	
	@Autowired
	private ClientDetailsRepository clientDetailsRepository;
	
	@Autowired
	private CoustomerNotificationService coustomerNotificationService;
	
	@Autowired
	private JwtBasedCurrentUserProvider basedCurrentUserProvider;

	public void createAndSendBill(Map<String, ?> request) {
		
		
		 Long requestCompanyId = request.get(Constants.COMPANY_ID) != null ? Long.parseLong(request.get(Constants.COMPANY_ID).toString()) : null;
		 
		 
		  CoustomerBill bill = createCustomerBill(request, requestCompanyId);
		File pdfFile = generatePDF(bill);
		billService.sendEmail((String) request.get("email"), pdfFile);
	}

	// Method to create and store customer bill
	 public CoustomerBill createCustomerBill(Map<String, ?> request, Long companyId) {
	        Double amount = Double.parseDouble(request.get("amount").toString());

	        CoustomerBill coustomerBill = new CoustomerBill();
	        coustomerBill.setCustomerName((String) request.get(Constants.FIELD_CUSTOMER_NAME));
	        coustomerBill.setEmail((String) request.get(Constants.FIELD_BILL_EMAIL));
	        coustomerBill.setBillAmount(amount);
	        coustomerBill.setServiceTitle((String) request.get(Constants.FIELD_SERVICE_TITLE));
	        coustomerBill.setServiceDesc((String) request.get(Constants.FIELD_SERVICE_DESC));
	        coustomerBill.setPhno((String) request.get(Keys.MOBILE));
	        coustomerBill.setGeneratedBy((String) request.get(Constants.FIELD_GENERATED_BY));
	        coustomerBill.setDueDate(LocalDate.parse(request.get(Constants.BILL_DUE_DATE).toString()));
	        coustomerBill.setBillingDate(LocalDate.now());
	        coustomerBill.setCompanyId(companyId); // Set companyId

	        return coustomerBillRepository.save(coustomerBill);
	    }


	public File generatePDF(CoustomerBill bill) {

		return pdfService.createPDF(bill);
	}

	public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllBills(Integer pageNum, Integer pageSize,Map<String,?>request) {
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		
		Pageable pageable = PageRequest.of(Math.max(0, pageNum - 1), pageSize, Sort.by(Sort.Order.desc("billingDate")));
		Page<CoustomerBill> billPage = coustomerBillRepository.findByCompanyId(requestCompanyId,pageable);
		List<Map<String, Object>> parsedBills = billPage.getContent().stream().map(bill -> {
			Map<String, Object> billMap = new HashMap<>();
			billMap.put("Bill ID", bill.getId());
			billMap.put("customerName", bill.getCustomerName());
			billMap.put("email", bill.getEmail());
			billMap.put("amount", bill.getBillAmount());
			billMap.put("serviceTitle", bill.getServiceTitle());
			billMap.put("serviceDesc", bill.getServiceDesc());
			billMap.put("phno", bill.getPhno());
			billMap.put("generatedBy", bill.getGeneratedBy());
			billMap.put("billingDate", bill.getBillingDate());
			String status = bill.isPending() ? "PAID" : "PENDING";
			billMap.put("status", status);
			billMap.put("Due Date", bill.getDueDate());
			return billMap;
		}).collect(Collectors.toList());

		Map<String, Object> responseAttributes = new HashMap<>();
		responseAttributes.put("bills", parsedBills);
		responseAttributes.put("totalBills", billPage.getTotalElements());
		responseAttributes.put("totalPages", billPage.getTotalPages());
		responseAttributes.put("currentPage", pageNum);

		// Wrap response in ResponseDTO and return
		ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
		responseDTO.setAttributes(responseAttributes);
		return ResponseEntity.ok(responseDTO);
	}

	@Scheduled(cron = "0 0 0 1 * ?") // Runs at midnight on the 1st of every month
	//@Scheduled(cron = "0 */2 * * * ?")
	public void generateAndSendBills() {
		LOGGER.info("Starting monthly customer bill generation and email process.");

		//List<CoustomerBill> bills = coustomerBillRepository.findAll();// find by previous month bills
		List<CoustomerBill> bills = coustomerBillRepository.findPreviousMonthBills();

	    if (bills.isEmpty()) {
	        throw new NotFoundException("previous months bill not found");
	        
	    }
		LocalDate newInvoiceDate = LocalDate.now(); // Today's date

		for (CoustomerBill bill : bills) {
			try {
				
				CoustomerBill newBill = new CoustomerBill();
				newBill.setCustomerName(bill.getCustomerName());
				newBill.setEmail(bill.getEmail());
				newBill.setBillingDate(newInvoiceDate);
				newBill.setServiceDesc(bill.getServiceDesc());
				newBill.setBillAmount(bill.getBillAmount());
				newBill.setGeneratedBy(bill.getGeneratedBy());
				newBill.setPhno(bill.getPhno());
				newBill.setServiceTitle(bill.getServiceTitle());
				newBill.setDueDate( LocalDate.now().plusDays(2));
				newBill.setActivateSendMailButton(true);
				
				coustomerBillRepository.save(newBill);

			} catch (Exception e) {
				LOGGER.error("Failed to generate or send bill for customer: {}", bill.getEmail(), e);
			}
		}

	}
	
	public void deleteCoustomerBill(Map<String, ?> entity) {
		
		// TODO Auto-generated method stub
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(entity.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		Long billId=Long.parseLong(entity.get(Keys.ID).toString());
		if(coustomerBillRepository.existsById(billId))
		{
			coustomerBillRepository.deleteById(billId);
		}
		else 
		{
			throw new NotFoundException("Bill Not Found with ID: " + billId);
		}
		
	}
	
	public void markBill(Map<String, ?> entity) {
		// TODO Auto-generated method stub
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(entity.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		Long billId = Long.parseLong(entity.get(Keys.ID).toString());

		Optional<CoustomerBill> billOptioal = coustomerBillRepository.findById(billId);
		if (billOptioal.isEmpty())
		{
			throw new NotFoundException("Coustomer Bill Records Not Found");
		}
		CoustomerBill bill=billOptioal.get();
		bill.setPending(true);
		coustomerBillRepository.save(bill);
	
	}

	public void sentMail(Map<String, ?> request) {
		// TODO Auto-generated method stub
		
		Long companyId=basedCurrentUserProvider.getCurrentCompanyId();
		Long requestCompanyId=Long.parseLong(request.get(Constants.COMPANY_ID).toString());
		if(companyId!=requestCompanyId)
		{
			throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
		}
		Long billId=Long.parseLong(request.get(Keys.ID).toString());
		Optional<CoustomerBill> billOptioal = coustomerBillRepository.findById(billId);
		if (billOptioal.isEmpty())
		{
			throw new NotFoundException("Coustomer Bill Records Not Found");
		}
		CoustomerBill coustomerBill=billOptioal.get();
		File billPdf = pdfService.createPDF(coustomerBill);
		emailService.sendBillEmail(coustomerBill.getEmail(), billPdf);
		coustomerBill.setMailSent(true);
		coustomerBillRepository.save(coustomerBill);
		
	
	}
	
	public ResponseEntity<ResponseDTO<Map<String, Object>>> getFilteredBills(Integer pageNum, Integer pageSize, String email, String phno, String status, Long companyId) {
	    Pageable pageable = PageRequest.of(Math.max(0, pageNum - 1), pageSize, Sort.by(Sort.Order.desc("billingDate")));

	    Boolean isPending = null;
	    if (status != null) {
	        if ("PAID".equalsIgnoreCase(status)) {
	            isPending = true; // Paid means not pending
	        } else if ("PENDING".equalsIgnoreCase(status)) {
	            isPending = false;
	        }
	    }

	    Page<CoustomerBill> billPage = coustomerBillRepository.findByFiltersAndCompanyId(
	        (email != null && !email.trim().isEmpty()) ? email.trim() : null,
	        (phno != null && !phno.trim().isEmpty()) ? phno.trim() : null,
	        isPending,
	        companyId,
	        pageable
	    );

	    if (billPage.isEmpty()) {
	        throw new NotFoundException("No records found matching the given filters.");
	    }

	    List<Map<String, Object>> parsedBills = billPage.getContent().stream().map(bill -> {
	        Map<String, Object> billMap = new HashMap<>();
	        billMap.put("Bill ID", bill.getId());
	        billMap.put("customerName", bill.getCustomerName());
	        billMap.put("email", bill.getEmail());
	        billMap.put("amount", bill.getBillAmount());
	        billMap.put("serviceTitle", bill.getServiceTitle());
	        billMap.put("serviceDesc", bill.getServiceDesc());
	        billMap.put("phno", bill.getPhno());
	        billMap.put("generatedBy", bill.getGeneratedBy());
	        billMap.put("billingDate", bill.getBillingDate());
	        billMap.put("status", bill.isPending() ? "PAID" : "PENDING");
	        billMap.put("Due Date", bill.getDueDate());
	        billMap.put(Constants.COMPANY_ID, bill.getCompanyId());
	        return billMap;
	    }).collect(Collectors.toList());

	    Map<String, Object> responseAttributes = new HashMap<>();
	    responseAttributes.put("bills", parsedBills);
	    responseAttributes.put("totalBills", billPage.getTotalElements());
	    responseAttributes.put("totalPages", billPage.getTotalPages());
	    responseAttributes.put("currentPage", pageNum);

	    ResponseDTO<Map<String, Object>> responseDTO = new ResponseDTO<>();
	    responseDTO.setAttributes(responseAttributes);

	    return ResponseEntity.ok(responseDTO);
	}


	@Scheduled(cron = "0 0 9 * * ?") // Runs every day at 9 AM
	public void sendCustomerBillReminders() {
	    LocalDate today = LocalDate.now();
	    LocalDate reminderDate = today.plusDays(2);

	    List<CoustomerBill> dueBills = coustomerBillRepository.findBillsDueToday(today);
	    List<CoustomerBill> dueBillsBeforeTwoDays = coustomerBillRepository.findBillsDueToday(reminderDate);

	    for (CoustomerBill bill : dueBills) {
	      //  File pdfFile = pdfService.createPDF(bill);
	        emailService.sendBillDueReminder(bill.getEmail());
	    }
	    
	    for (CoustomerBill bill : dueBillsBeforeTwoDays) {
	        //File pdfFile = pdfService.createPDF(bill);
	        emailService.sendBillDueReminderBeforeTwoDays(bill.getEmail());
	        
	        ClientDetails client = clientDetailsRepository.findByEmail(bill.getEmail());
	        if (client != null) {
	            // Create notification for this client
	            Map<String, ?> notificationRequest = Map.of(
	                Constants.COUSTOMER_ID, client.getClientId(),
	                Constants.FIELD_NOTIFICATION_TITLE, "Upcoming Bill Due",
	                Constants.FIELD_NOTIFICATION_TEXT, "Your bill is due in 2 days. Please make the payment to avoid late fees."
	            );
	            coustomerNotificationService.createNotification(notificationRequest);
	        }
	    }
	}



}
