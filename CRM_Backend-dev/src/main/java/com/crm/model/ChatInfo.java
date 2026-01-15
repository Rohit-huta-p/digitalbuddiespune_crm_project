package com.crm.model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "chat_info")
@Data
public class ChatInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userschatid", nullable = false, unique = true, updatable = false)
    private Integer chatId;

    @Column(name = "startedby", nullable = false, updatable = false)
    private Long startedBy;  

    @Column(name = "receivedby", nullable = false, updatable = false)
    private Long receivedBy;  

    @Column(name = "lastmsgsentby", nullable = true, updatable = true)
    private Long lastMessageSentBy;

    @Column(name = "lastmsgsenton", nullable = true)
    private LocalDateTime lastMessageSentOn;

    @Column(name = "lastmessageseen", nullable = false)
    private boolean lastMessageSeen = false;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "createdat", nullable = false, updatable = false)
    private LocalDateTime createdAt = DateTimeHelper.getCurrentTime();

    @JsonManagedReference
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "chatInfo")
    private List<ChatMessage> messagesList;
}