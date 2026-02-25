package com.crm.model;

import java.time.LocalDate;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "bill_details")
@AllArgsConstructor
@NoArgsConstructor
public class Bill {

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

    private String phno;

    private String serviceTitle;

    private String serviceDesc;

    private LocalDate billingDate;

    private String generatedBy;

    private LocalDate billDueDate;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "is_pending", nullable = false)
    private boolean isPending = false;

    // ✅ NEW FIELD
    @Column(name = "invoice_number", unique = true, nullable = false)
    private String invoiceNumber;

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
