package com.crm.model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "group_chats")
@Data
public class GroupChat {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "group_id", nullable = false, unique = true, updatable = false)
	private Long groupId;

	@Column(name = "group_name", nullable = false)
	private String groupName;

	@Column(name = "group_desc", nullable = true)
	private String groupDesc;

	@Column(name = "created_by", nullable = false, updatable = false)
	private Long createdById;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@ManyToMany
	@JoinTable(name = "group_chat_participants", joinColumns = @JoinColumn(name = "group_id"), inverseJoinColumns = @JoinColumn(name = "id"))
	private List<Employee> participants;
	
	@Column(name = "group_leader", nullable = true)
    private Long groupLeader;
	
	@Column(name = "company_id", nullable = false)
	private Long companyId;

	@JsonManagedReference
	@OneToMany(mappedBy = "groupChat", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<GroupMessage> messages;
}
