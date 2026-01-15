package com.crm.controller;

import com.crm.model.Employee;
import com.crm.model.FollowUp;
import com.crm.model.Lead;
import com.crm.model.dto.FollowUpDTO;
import com.crm.model.dto.LeadDTO;
import com.crm.service.LeadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService service;

    public LeadController(LeadService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<LeadDTO> create(@RequestBody java.util.Map<String, Object> body) {
        Lead lead = new Lead();
        lead.setName(body.get("name").toString());
        lead.setPhoneNumber(body.get("phoneNumber").toString());
        lead.setBusiness(body.get("business").toString());
        
        // Set employee by creating a reference with just the ID
        Employee emp = new Employee();
        emp.setId(Long.parseLong(body.get("employeeId").toString()));
        lead.setEmployee(emp);
        
        Lead saved = service.createLead(lead);
        return ResponseEntity.ok(LeadDTO.fromEntity(saved));
    }

    @GetMapping
    public ResponseEntity<List<LeadDTO>> all() {
        List<Lead> leads = service.listAllLeads();
        List<LeadDTO> dtos = leads.stream()
                .map(LeadDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeadDTO> get(@PathVariable Long id) {
        Lead l = service.getById(id);
        if (l == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(LeadDTO.fromEntity(l));
    }

    @PostMapping("/{leadId}/followups")
    public ResponseEntity<FollowUpDTO> addFollowUp(@PathVariable Long leadId, @RequestBody FollowUp fu) {
        FollowUp saved = service.addFollowUp(leadId, fu);
        return ResponseEntity.ok(FollowUpDTO.fromEntity(saved));
    }

    @GetMapping("/{leadId}/followups")
    public ResponseEntity<List<FollowUpDTO>> getFollowUps(@PathVariable Long leadId) {
        List<FollowUp> followUps = service.getFollowUps(leadId);
        List<FollowUpDTO> dtos = followUps.stream()
                .map(FollowUpDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/status")
    public ResponseEntity<LeadDTO> updateStatus(@RequestBody java.util.Map<String, Object> body) {
        Long leadId = Long.parseLong(body.get("leadId").toString());
        String status = body.get("status").toString();
        Lead updated = service.updateLeadStatus(leadId, status);
        return ResponseEntity.ok(LeadDTO.fromEntity(updated));
    }
}
