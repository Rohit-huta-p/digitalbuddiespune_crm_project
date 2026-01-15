package com.crm.service;

import com.crm.exception.NotFoundException;
import com.crm.model.ClientDetails;
import com.crm.model.Social;
import com.crm.repos.ClientDetailsRepository;
import com.crm.repos.SocialRepository;
import com.crm.utility.JwtBasedCurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class SocialService {

    private final SocialRepository socialRepo;
    private final ClientDetailsRepository clientRepo;
    private final JwtBasedCurrentUserProvider currentUserProvider; // optional, null-safe

    public SocialService(SocialRepository socialRepo,
                         ClientDetailsRepository clientRepo,
                         JwtBasedCurrentUserProvider currentUserProvider) {
        this.socialRepo = socialRepo;
        this.clientRepo = clientRepo;
        this.currentUserProvider = currentUserProvider;
    }

    public Social save(Social entry) {
        // attach client entity if clientId provided
        if (entry.getClient() != null && entry.getClient().getClientId() != null) {
            ClientDetails client = clientRepo.findById(entry.getClient().getClientId())
                    .orElseThrow(() -> new NotFoundException("Client not found with ID: " + entry.getClient().getClientId()));
            entry.setClient(client);
        }

        // ✅ set createdBy from current companyId if not provided
        try {
            if (entry.getCreatedBy() == null && currentUserProvider != null) {
                Long companyId = currentUserProvider.getCurrentCompanyId();
                if (companyId != null) entry.setCreatedBy(companyId);
            }
        } catch (Exception ignored) {
            // fallback — keep null if no security context
        }

        return socialRepo.save(entry);
    }

    public List<Social> getAll() {
        return socialRepo.findAll();
    }

    public List<Social> getBetween(LocalDateTime start, LocalDateTime end) {
        return socialRepo.findByScheduledAtBetween(start, end);
    }

    public List<Social> getByClient(Long clientId) {
        return socialRepo.findByClient_ClientId(clientId);
    }

    public void delete(Long id) {
        if (!socialRepo.existsById(id)) {
            throw new NotFoundException("Social entry not found with ID: " + id);
        }
        socialRepo.deleteById(id);
    }
}
