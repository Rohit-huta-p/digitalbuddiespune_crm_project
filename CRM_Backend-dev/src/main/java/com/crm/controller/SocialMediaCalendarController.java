package com.crm.controller;

import com.crm.model.SocialMediaCalendar;
import com.crm.model.dto.SocialCalendarRequest;
import com.crm.model.dto.ResponseDTO;
import com.crm.service.SocialMediaCalendarService;
import com.crm.utility.JwtBasedCurrentUserProvider;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/social")
public class SocialMediaCalendarController {

    private final SocialMediaCalendarService service;
    private final JwtBasedCurrentUserProvider currentUserProvider;

    public SocialMediaCalendarController(SocialMediaCalendarService service,
                                         JwtBasedCurrentUserProvider currentUserProvider) {
        this.service = service;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> create(@Valid @RequestBody SocialCalendarRequest req) {

        SocialMediaCalendar cal = SocialMediaCalendar.builder()
                .clientId(req.getClientId())
                .title(req.getTitle().trim())
                .mediaType(req.getMediaType())
                .referenceLink(req.getReferenceLink())
                .mediaLink(req.getMediaLink())
                .colorFormat(req.getColorFormat())
                .scheduledAt(req.getScheduledAt())
                .status(req.getStatus() != null ? req.getStatus() : "SCHEDULED")
                .notes(req.getNotes())
                .createdBy(currentUserProvider.getCurrentCompanyId())

                .build();

        SocialMediaCalendar saved = service.create(cal);

        Map<String, Object> attrs = new HashMap<>();
        attrs.put("message", "Social entry created");
        attrs.put("id", saved.getId());

        ResponseDTO<Map<String, Object>> dto = new ResponseDTO<>();
        dto.setAttributes(attrs);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> update(@PathVariable Long id,
                                                                   @RequestBody SocialCalendarRequest req) {

        SocialMediaCalendar update = SocialMediaCalendar.builder()
                .title(req.getTitle())
                .mediaType(req.getMediaType())
                .referenceLink(req.getReferenceLink())
                .mediaLink(req.getMediaLink())
                .colorFormat(req.getColorFormat())
                .scheduledAt(req.getScheduledAt())
                .status(req.getStatus())
                .notes(req.getNotes())
                .build();

        SocialMediaCalendar updated = service.update(id, update);

        Map<String, Object> attrs = new HashMap<>();
        attrs.put("message", "Social entry updated");
        attrs.put("id", updated.getId());

        ResponseDTO<Map<String, Object>> dto = new ResponseDTO<>();
        dto.setAttributes(attrs);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/range")
    public ResponseEntity<List<SocialMediaCalendar>> getRange(@RequestBody Map<String, String> body) {
        LocalDateTime from = LocalDateTime.parse(body.get("from"));
        LocalDateTime to = LocalDateTime.parse(body.get("to"));
        return ResponseEntity.ok(service.findBetween(from, to));
    }

    @PostMapping("/client")
    public ResponseEntity<List<SocialMediaCalendar>> getByClient(@RequestBody Map<String, Object> body) {
        Long clientId = Long.parseLong(body.get("clientId").toString());
        return ResponseEntity.ok(service.findByClient(clientId));
    }

    @PostMapping("/status")
    public ResponseEntity<List<SocialMediaCalendar>> getByStatus(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.findByStatus(body.get("status")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SocialMediaCalendar> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findByIdOrThrow(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> delete(@PathVariable Long id) {
        service.delete(id);
        Map<String, Object> attrs = new HashMap<>();
        attrs.put("message", "Deleted");

        ResponseDTO<Map<String, Object>> dto = new ResponseDTO<>();
        dto.setAttributes(attrs);
        return ResponseEntity.ok(dto);
    }
}
