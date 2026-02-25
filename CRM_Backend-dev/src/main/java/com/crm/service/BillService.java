package com.crm.service;

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

import java.io.File;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import com.crm.controller.Keys;
import com.crm.exception.ForBiddenException;
import com.crm.exception.NotFoundException;
import com.crm.model.Bill;
import com.crm.model.dto.ResponseDTO;
import com.crm.repos.BillRepository;
import com.crm.utility.Constants;
import com.crm.utility.JwtBasedCurrentUserProvider;

@Service
public class BillService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BillService.class);

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtBasedCurrentUserProvider basedCurrentUserProvider;

    public void createAndSendBill(Map<String, ?> request) {
        LOGGER.info("in create and send bill method");

        Bill bill = createBill(request);
        File pdfFile = generatePDF(bill);
        sendEmail((String) request.get("email"), pdfFile);
    }

    public Bill createBill(Map<String, ?> request) {
        LOGGER.info("in create bill method");

        Double amount = Double.parseDouble(request.get("amount").toString());
        Long companyId = Long.parseLong(request.get(Constants.COMPANY_ID).toString());

        Bill bill = new Bill();
        bill.setCustomerName((String) request.get(Constants.FIELD_CUSTOMER_NAME));
        bill.setEmail((String) request.get(Constants.FIELD_BILL_EMAIL));
        bill.setBillAmount(amount);
        bill.setServiceTitle((String) request.get(Constants.FIELD_SERVICE_TITLE));
        bill.setServiceDesc((String) request.get(Constants.FIELD_SERVICE_DESC));
        bill.setPhno((String) request.get(Keys.MOBILE));
        bill.setGeneratedBy((String) request.get(Constants.FIELD_GENERATED_BY));
        bill.setBillingDate(LocalDate.now());
        bill.setBillDueDate(LocalDate.parse(request.get(Constants.BILL_DUE_DATE).toString()));
        bill.setCompanyId(companyId);

        if (request.containsKey("taxAmount") && request.get("taxAmount") != null
                && !request.get("taxAmount").toString().isEmpty()) {
            bill.setTaxAmount(Double.parseDouble(request.get("taxAmount").toString()));
        }
        if (request.containsKey("discountAmount") && request.get("discountAmount") != null
                && !request.get("discountAmount").toString().isEmpty()) {
            bill.setDiscountAmount(Double.parseDouble(request.get("discountAmount").toString()));
        }
        if (request.containsKey("paymentMethod") && request.get("paymentMethod") != null) {
            bill.setPaymentMethod(request.get("paymentMethod").toString());
        }
        if (request.containsKey("notes") && request.get("notes") != null) {
            bill.setNotes(request.get("notes").toString());
        }
        if (request.containsKey("billingAddress") && request.get("billingAddress") != null) {
            bill.setBillingAddress(request.get("billingAddress").toString());
        }

        // ✅ Invoice Number Handling
        String invoiceNumber = null;
        if (request.containsKey("invoiceNumber") && request.get("invoiceNumber") != null) {
            invoiceNumber = request.get("invoiceNumber").toString();
        } else {
            invoiceNumber = generateInvoiceNumber(companyId);
        }

        // Ensure uniqueness
        while (billRepository.findByInvoiceNumber(invoiceNumber).isPresent()) {
            invoiceNumber = generateInvoiceNumber(companyId);
        }

        bill.setInvoiceNumber(invoiceNumber);

        return billRepository.save(bill);
    }

    public File generatePDF(Bill bill) {
        return pdfService.createPDF(bill);
    }

    public void sendEmail(String customerEmail, File billFile) {
        emailService.sendBillEmail(customerEmail, billFile);
    }

    @Scheduled(cron = "0 0 9 * * ?") // Runs every day at 9 AM
    public void sendDueDateReminderEmails() {
        LocalDate today = LocalDate.now();
        LocalDate reminderDate = LocalDate.now().plusDays(2);

        List<Bill> dueBills = billRepository.findByBillDueDate(today);
        List<Bill> dueBillsBeforeTwoDays = billRepository.findByBillDueDate(reminderDate);

        for (Bill bill : dueBills) {
            File pdfFile = pdfService.createPDF(bill);
            emailService.sendBillDueReminder(bill.getEmail(), pdfFile);
        }
        for (Bill bill : dueBillsBeforeTwoDays) {
            File pdfFile = pdfService.createPDF(bill);
            emailService.sendBillDueReminderBeforeTwoDays(bill.getEmail(), pdfFile);
        }
    }

    public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllBills(Integer pageNum, Integer pageSize) {
        Pageable pageable = PageRequest.of(Math.max(0, pageNum - 1), pageSize, Sort.by(Sort.Order.desc("billingDate")));
        Page<Bill> billPage = billRepository.findAll(pageable);

        List<Map<String, Object>> parsedBills = billPage.getContent().stream().map(bill -> {
            Map<String, Object> billMap = new HashMap<>();
            billMap.put("Bill Id", bill.getId());
            billMap.put("invoiceNumber", bill.getInvoiceNumber());
            billMap.put("customerName", bill.getCustomerName());
            billMap.put("email", bill.getEmail());
            billMap.put("amount", bill.getBillAmount());
            billMap.put("serviceTitle", bill.getServiceTitle());
            billMap.put("serviceDesc", bill.getServiceDesc());
            billMap.put("phno", bill.getPhno());
            billMap.put("generatedBy", bill.getGeneratedBy());
            billMap.put("billingDate", bill.getBillingDate());
            billMap.put("billDueDate", bill.getBillDueDate());
            billMap.put("taxAmount", bill.getTaxAmount());
            billMap.put("discountAmount", bill.getDiscountAmount());
            billMap.put("paymentMethod", bill.getPaymentMethod());
            billMap.put("notes", bill.getNotes());
            billMap.put("billingAddress", bill.getBillingAddress());
            String status = bill.isPending() ? "PAID" : "PENDING";
            billMap.put("status", status);
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

    public void deleteBill(Map<String, ?> entity) {
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        Long requestCompanyId = Long.parseLong(entity.get(Constants.COMPANY_ID).toString());

        if (!companyId.equals(requestCompanyId)) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }

        Long billId = Long.parseLong(entity.get(Keys.ID).toString());
        if (billRepository.existsById(billId)) {
            billRepository.deleteById(billId);
        } else {
            throw new NotFoundException("Bill Not Found with ID: " + billId);
        }
    }

    public void markBill(Map<String, ?> entity) {
        Long billId = Long.parseLong(entity.get(Keys.ID).toString());
        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        Long requestCompanyId = Long.parseLong(entity.get(Constants.COMPANY_ID).toString());

        if (!companyId.equals(requestCompanyId)) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }

        Optional<Bill> billOptioal = billRepository.findById(billId);
        if (billOptioal.isEmpty()) {
            throw new NotFoundException("Bill Records Not Found");
        }

        Bill bill = billOptioal.get();
        bill.setPending(true);
        billRepository.save(bill);
    }

    public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllBillsWithFilters(
            Integer pageNum, Integer pageSize, String email, String phno, String status, Long requestCompanyId) {

        Long companyId = basedCurrentUserProvider.getCurrentCompanyId();
        if (!companyId.equals(requestCompanyId)) {
            throw new ForBiddenException(Constants.COMPANY_ACCESS_DENIED);
        }

        Pageable pageable = PageRequest.of(Math.max(0, pageNum - 1), pageSize, Sort.by(Sort.Order.desc("billingDate")));

        Boolean isPending = null;
        if (status != null) {
            if ("PAID".equalsIgnoreCase(status)) {
                isPending = true;
            } else if ("PENDING".equalsIgnoreCase(status)) {
                isPending = false;
            }
        }

        Page<Bill> billPage = billRepository.findByFilters(
                (email != null && !email.trim().isEmpty()) ? email.trim() : null,
                (phno != null && !phno.trim().isEmpty()) ? phno.trim() : null,
                isPending,
                requestCompanyId,
                pageable);

        if (billPage.isEmpty()) {
            throw new NotFoundException("No records found matching the given filters.");
        }

        List<Map<String, Object>> parsedBills = billPage.getContent().stream().map(bill -> {
            Map<String, Object> billMap = new HashMap<>();
            billMap.put("Bill Id", bill.getId());
            billMap.put("invoiceNumber", bill.getInvoiceNumber());
            billMap.put("customerName", bill.getCustomerName());
            billMap.put("email", bill.getEmail());
            billMap.put("amount", bill.getBillAmount());
            billMap.put("serviceTitle", bill.getServiceTitle());
            billMap.put("serviceDesc", bill.getServiceDesc());
            billMap.put("phno", bill.getPhno());
            billMap.put("generatedBy", bill.getGeneratedBy());
            billMap.put("billingDate", bill.getBillingDate());
            billMap.put("billDueDate", bill.getBillDueDate());
            billMap.put("taxAmount", bill.getTaxAmount());
            billMap.put("discountAmount", bill.getDiscountAmount());
            billMap.put("paymentMethod", bill.getPaymentMethod());
            billMap.put("notes", bill.getNotes());
            billMap.put("billingAddress", bill.getBillingAddress());
            billMap.put(Constants.COMPANY_ID, bill.getCompanyId());
            String statusText = bill.isPending() ? "PAID" : "PENDING";
            billMap.put("status", statusText);
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

    // ✅ Utility method to generate unique invoice number
    private String generateInvoiceNumber(Long companyId) {
        return "INV-" + companyId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
