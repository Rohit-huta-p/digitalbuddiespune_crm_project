// ✅ NEW FILE CREATED
package com.crm.service;

import com.crm.model.FollowUp;
import com.crm.model.Lead;
import com.crm.repos.FollowUpRepository;
import com.crm.repos.LeadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

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
}
