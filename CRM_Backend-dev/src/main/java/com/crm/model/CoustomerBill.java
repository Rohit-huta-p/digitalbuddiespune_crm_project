package com.crm.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "coustomer_bill")
public class CoustomerBill {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;
	@Column(name = "customer_name")
	private String customerName;

	@Column(name = "bill_amount")
	private double billAmount;
	@Column(name = "email")
	private String email;

	@Column(name = "phno")
	private String phno;

	@Column(name = "service_title")
	private String serviceTitle;

	@Column(name = "service_desc")
	private String serviceDesc;

	@Column(name = "bill_date")
	private LocalDate billingDate;

	@Column(name = "generated_by")
	private String generatedBy;

	@Column(name = "is_pending", nullable = false)
	private boolean isPending = false;

	@Column(name = "bill_due_date")
	private LocalDate dueDate;

	@Column(name = "company_id", nullable = false)
	private Long companyId;

	@Column(name = "is_mail_sent", nullable = false)
	private boolean isMailSent = false;

	private boolean activateSendMailButton = false;

	@Column(name = "tax_amount")
	private Double taxAmount;

	@Column(name = "discount_amount")
	private Double discountAmount;

	@Column(name = "payment_method")
	private String paymentMethod;

	@Column(columnDefinition = "TEXT")
	private String notes;

	@Column(name = "billing_address", columnDefinition = "TEXT")
	private String billingAddress;
}
