// ✅ NEW FILE CREATED
package com.crm.service;

import com.crm.model.Employee;
import com.crm.model.FollowUp;
import com.crm.model.Lead;
import com.crm.repos.FollowUpRepository;
import com.crm.repos.LeadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final FollowUpRepository followUpRepository;

    public LeadService(LeadRepository leadRepository, FollowUpRepository followUpRepository) {
        this.leadRepository = leadRepository;
        this.followUpRepository = followUpRepository;
    }

    public Lead createLead(Lead lead) {
        lead.setCreatedAt(LocalDateTime.now());
        lead.setUpdatedAt(LocalDateTime.now());
        return leadRepository.save(lead);
    }

    @Transactional
    public FollowUp addFollowUp(Long leadId, FollowUp fu) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found: " + leadId));
        fu.setLead(lead);
        fu.setCreatedAt(LocalDateTime.now());
        FollowUp saved = followUpRepository.save(fu);

        lead.setStatus("CONTACTED");
        lead.setUpdatedAt(LocalDateTime.now());
        leadRepository.save(lead);

        return saved;
    }

    public List<FollowUp> getFollowUps(Long leadId) {
        return followUpRepository.findByLeadIdOrderByCreatedAtDesc(leadId);
    }

    public List<Lead> listAllLeads() {
        return leadRepository.findAll();
    }

    public Lead getById(Long id) {
        return leadRepository.findById(id).orElse(null);
    }

    @Transactional
    public Lead updateLeadStatus(Long leadId, String status) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found: " + leadId));
        lead.setStatus(status);
        lead.setUpdatedAt(LocalDateTime.now());
        return leadRepository.save(lead);
    }

    @Transactional
    public Lead updateLead(Long leadId, Map<String, Object> fields) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new IllegalArgumentException("Lead not found: " + leadId));

        if (fields.containsKey("name")) {
            lead.setName(fields.get("name").toString());
        }
        if (fields.containsKey("phoneNumber")) {
            lead.setPhoneNumber(fields.get("phoneNumber").toString());
        }
        if (fields.containsKey("business")) {
            lead.setBusiness(fields.get("business").toString());
        }
        if (fields.containsKey("status")) {
            lead.setStatus(fields.get("status").toString());
        }
        if (fields.containsKey("employeeId")) {
            Employee emp = new Employee();
            emp.setId(Long.parseLong(fields.get("employeeId").toString()));
            lead.setEmployee(emp);
        }

        lead.setUpdatedAt(LocalDateTime.now());
        return leadRepository.save(lead);
    }
}
