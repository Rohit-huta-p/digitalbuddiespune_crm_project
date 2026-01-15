package com.crm.controller;

import com.crm.model.Social;
import com.crm.service.SocialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/social")
public class SocialController {

    private final SocialService socialService;

    public SocialController(SocialService socialService) {
        this.socialService = socialService;
    }

    // Create or update
    @PostMapping("/save")
    public ResponseEntity<Social> save(@RequestBody Social entry) {
        Social saved = socialService.save(entry);
        return ResponseEntity.ok(saved);
    }

    // List all
    @GetMapping("/all")
    public ResponseEntity<List<Social>> getAll() {
        return ResponseEntity.ok(socialService.getAll());
    }

    // Get by date range (JSON body)
    @PostMapping("/range")
    public ResponseEntity<List<Social>> getRange(@RequestBody Map<String, String> request) {
        String fromStr = request.get("from");
        String toStr = request.get("to");

        if (fromStr == null || toStr == null)
            throw new IllegalArgumentException("Both 'from' and 'to' fields are required. Format: 2025-11-01T00:00:00");

        LocalDateTime start = LocalDateTime.parse(fromStr);
        LocalDateTime end = LocalDateTime.parse(toStr);

        return ResponseEntity.ok(socialService.getBetween(start, end));
    }

    // Get by client (JSON body)
    @PostMapping("/client")
    public ResponseEntity<List<Social>> getByClient(@RequestBody Map<String, Object> request) {
        if (!request.containsKey("clientId"))
            throw new IllegalArgumentException("'clientId' is required.");

        Long clientId = Long.parseLong(request.get("clientId").toString());
        return ResponseEntity.ok(socialService.getByClient(clientId));
    }

    // Delete by id (JSON body)
    @PostMapping("/delete")
    public ResponseEntity<String> delete(@RequestBody Map<String, Object> request) {
        if (!request.containsKey("id"))
            throw new IllegalArgumentException("'id' is required.");

        Long id = Long.parseLong(request.get("id").toString());
        socialService.delete(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}
