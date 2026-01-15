package com.crm.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class EmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendBillEmail(String to, File billFile) {


        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Bill");
        message.setText("Please find attached your bill.");

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setFrom("your-email@example.com");
            helper.setTo(to);
            helper.setSubject("Your Bill");
            helper.setText("Please find attached your bill.");
            helper.addAttachment(billFile.getName(), billFile);

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
    
    public void sendOtpEmail(String to, String otpCode) {
      
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false);
            helper.setTo(to);
            helper.setSubject("Your OTP for Password Reset");
            helper.setText("Hello,\n\nYour OTP for password reset is: " + otpCode + 
                           "\nThis OTP is valid for 5 minutes.\n\nThank you.");

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            
        }
    }
    
    public void sendBillDueReminder(String to, File billFile) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
        
            helper.setTo(to);
            helper.setSubject("Bill Due Reminder");
            helper.setText("Dear Customer,\n\nYour bill is due today. Please find the attached bill for your reference.\n\nThank you!");

            helper.addAttachment(billFile.getName(), billFile);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
    public void sendBillDueReminderBeforeTwoDays(String to, File billFile) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setTo(to);
            helper.setSubject("Bill Due Reminder");
            helper.setText("Dear Customer,\n\n"
            	    + "This is a friendly reminder that your bill is due in **two days**. "
            	    + "Please find the attached bill for your reference.\n\n"
            	    + "To avoid any late fees, we kindly request you to make the payment before the due date.\n\n"
            	    + "If you have already made the payment, please disregard this message.\n\n"
            	    + "Thank you for your prompt attention.\n\n"
            	    + "Best regards,\n[Company Name]");

            helper.addAttachment(billFile.getName(), billFile);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
    
    
    public void sendBillDueReminder(String to) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
        
            helper.setTo(to);
            helper.setSubject("Bill Due Reminder");
            helper.setText("Dear Customer,\n\nYour bill is due today. Please find the attached bill for your reference.\n\nThank you!");

           // helper.addAttachment(billFile.getName(), billFile);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
    public void sendBillDueReminderBeforeTwoDays(String to) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setTo(to);
            helper.setSubject("Bill Due Reminder");
            helper.setText("Dear Customer,\n\n"
            	    + "This is a friendly reminder that your bill is due in **two days**. "
            	    + "Please find the attached bill for your reference.\n\n"
            	    + "To avoid any late fees, we kindly request you to make the payment before the due date.\n\n"
            	    + "If you have already made the payment, please disregard this message.\n\n"
            	    + "Thank you for your prompt attention.\n\n"
            	    + "Best regards,\n[Company Name]");

           // helper.addAttachment(billFile.getName(), billFile);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
    
    public void sendEmail(String to, String subject, String messageText) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(messageText);

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            LOGGER.error("Failed to send email to " + to, e);
        }
    }



}
