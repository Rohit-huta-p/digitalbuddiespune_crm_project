package com.crm.service;

import com.crm.exception.NotFoundException;
import com.crm.model.SocialMediaCalendar;
import com.crm.repos.SocialMediaCalendarRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SocialMediaCalendarService {

    private final SocialMediaCalendarRepository repo;

    public SocialMediaCalendarService(SocialMediaCalendarRepository repo) {
        this.repo = repo;
    }

    public SocialMediaCalendar create(SocialMediaCalendar entry) {
        return repo.save(entry);
    }

    public SocialMediaCalendar update(Long id, SocialMediaCalendar update) {

        SocialMediaCalendar existing = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Social calendar entry not found: " + id));

        // Safe field-by-field updates
        if (update.getTitle() != null) existing.setTitle(update.getTitle());
        if (update.getMediaType() != null) existing.setMediaType(update.getMediaType());
        if (update.getReferenceLink() != null) existing.setReferenceLink(update.getReferenceLink());
        if (update.getMediaLink() != null) existing.setMediaLink(update.getMediaLink());
        if (update.getColorFormat() != null) existing.setColorFormat(update.getColorFormat());
        if (update.getScheduledAt() != null) existing.setScheduledAt(update.getScheduledAt());
        if (update.getStatus() != null) existing.setStatus(update.getStatus());
        if (update.getNotes() != null) existing.setNotes(update.getNotes());

        return repo.save(existing);
    }

    public List<SocialMediaCalendar> findBetween(LocalDateTime from, LocalDateTime to) {
        return repo.findByScheduledAtBetween(from, to);
    }

    public List<SocialMediaCalendar> findByClient(Long clientId) {
        return repo.findByClientId(clientId);
    }

    public List<SocialMediaCalendar> findByStatus(String status) {
        return repo.findByStatus(status);
    }

    public SocialMediaCalendar findByIdOrThrow(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Entry not found"));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new NotFoundException("Entry not found");
        repo.deleteById(id);
    }
}
