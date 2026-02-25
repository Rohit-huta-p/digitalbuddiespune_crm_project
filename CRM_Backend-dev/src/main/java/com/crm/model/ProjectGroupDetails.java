package com.crm.model;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectGroupDetails {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "project_id", nullable = false, unique = true, updatable = false)
	private Long projectId;

	@Column(name = "project_name", nullable = false)
	private String projectName;

	@Column(name = "project_desc", nullable = true)
	private String projectDesc;

	@OneToMany(mappedBy = "projectGroup", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Task> scheduleTask;

	@Column(name = "created_by", nullable = false, updatable = false)
	private Long createdById;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@OneToMany(mappedBy = "projectGroup", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProjectParticipant> participants;

	@Column(name = "status")
	private String status;

	@Column(name = "company_id", nullable = false)
	private Long companyId;

	@ManyToOne
	@JoinColumn(name = "client_id", referencedColumnName = "id", nullable = true)
	private ClientDetails client;

	/**
	 * Helper: derive group leaders from participants with role "Leader".
	 */
	public List<Employee> getGroupLeaders() {
		if (participants == null)
			return Collections.emptyList();
		return participants.stream()
				.filter(p -> "Leader".equalsIgnoreCase(p.getRole()))
				.map(ProjectParticipant::getEmployee)
				.collect(Collectors.toList());
	}
}
