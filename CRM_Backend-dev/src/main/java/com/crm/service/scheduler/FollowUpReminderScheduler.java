package com.crm.service.scheduler;

import com.crm.model.FollowUp;
import com.crm.model.Lead;
import com.crm.repos.FollowUpRepository;
import com.crm.service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class FollowUpReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(FollowUpReminderScheduler.class);

    private final FollowUpRepository followUpRepository;
    private final NotificationService notificationService;

    /**
     * Runs every 1 minute to check upcoming follow-ups.
     */
    @Transactional
    @Scheduled(fixedRate = 60000)
    public void sendFollowUpReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next5Min = now.plusMinutes(5);

        List<FollowUp> dueFollowUps = followUpRepository.findDueFollowUps(now, next5Min);

        if (dueFollowUps.isEmpty()) {
            log.debug("⏳ No follow-ups due between {} and {}", now, next5Min);
            return;
        }

        for (FollowUp f : dueFollowUps) {
            try {
                Lead lead = f.getLead();

                if (lead == null || lead.getEmployee() == null) {
                    log.warn("⚠️ Skipping FollowUp ID={} — missing lead or employee assignment", f.getId());
                    continue;
                }

                Long employeeId = lead.getEmployee().getId();
                String leadName = lead.getName() != null ? lead.getName() : "Unknown Lead";

                String message = "📞 Reminder: Follow up with lead '" + leadName + "' (" +
                        lead.getPhoneNumber() + ") scheduled at " + f.getCallTime() + ".";

                notificationService.sendSystemNotification(
                        employeeId,
                        "Follow-Up Reminder",
                        message
                );

                f.setCallStatus("REMINDER_SENT");
                followUpRepository.save(f);

                log.info("✅ Reminder sent for Lead={} | EmployeeID={} | FollowUpID={}",
                        leadName, employeeId, f.getId());

            } catch (Exception ex) {
                log.error("❌ Failed to process FollowUp ID=" + f.getId(), ex);
            }
        }
    }
}
