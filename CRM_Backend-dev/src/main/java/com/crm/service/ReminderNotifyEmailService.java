package com.crm.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class ReminderNotifyEmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ReminderNotifyEmailService.class);

    private final JavaMailSender emailSender;

    public ReminderNotifyEmailService(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }


    public void sendEmail(String to, String subject, String body) {

        LOGGER.info("Executing sendEmail()");

        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            emailSender.send(message);
        } catch (MailException | MessagingException e) {
            e.printStackTrace(); 
        }
    }


}
