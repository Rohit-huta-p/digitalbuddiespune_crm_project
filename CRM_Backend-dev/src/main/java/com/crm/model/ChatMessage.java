package com.crm.model;
//
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

//
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "chat_messages")
@Data
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_message_id", nullable = false, unique = true, updatable = false)
    private Integer chatMessageId;

    @ManyToOne
    @JoinColumn(name = "chat_id", referencedColumnName = "userschatid", nullable = false, updatable = false)
    private ChatInfo chatInfo;

    @Column(name = "messageby", nullable = false, updatable = false)
    private Long messageBy;

    @Column(name = "message", nullable = false, updatable = false)
    private String message;

    @Column(name = "seen", nullable = false, updatable = true)
    private boolean seen = false;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "createdat", nullable = false, updatable = false)
    private LocalDateTime createdAt = DateTimeHelper.getCurrentTime();
}