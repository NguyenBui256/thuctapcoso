package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "issues")
public class Issue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate dueDate;

    @ManyToOne
    @JoinColumn(name = "status_id")
    private ProjectSettingStatus status;

    @ManyToOne
    @JoinColumn(name = "type_id")
    private ProjectSettingType type;

    @ManyToOne
    @JoinColumn(name = "severity_id")
    private ProjectSettingSeverity severity;

    @ManyToOne
    @JoinColumn(name = "priority_id")
    private ProjectSettingPriority priority;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "epic_id")
    private Epic epic;

    @ManyToOne
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private ProjectMember assignee;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private ProjectMember createdBy;

    @Column(nullable = false)
    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "updated_by_id")
    private ProjectMember updatedBy;

    private LocalDateTime updatedDate;

    private Integer position;

    @ManyToMany
    @JoinTable(name = "issue_tags", joinColumns = @JoinColumn(name = "issue_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private List<ProjectSettingTag> tags = new ArrayList<>();
//
//    @OneToMany(cascade = CascadeType.ALL)
//    private List<Attachment> attachments = new ArrayList<>();
//
//    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL)
//    private List<Comment> comments = new ArrayList<>();
//
//    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL)
//    private List<Activity> activities = new ArrayList<>();
//
//    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL)
//    private List<Watcher> watchers = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "issues_attachments", joinColumns = @JoinColumn(name = "issue_id", referencedColumnName = "id", columnDefinition = "BIGINT"), inverseJoinColumns = @JoinColumn(name = "attachment_id", referencedColumnName = "id", columnDefinition = "BIGINT"))
    private List<Attachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL)
    private List<Activity> activities = new ArrayList<>();

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL)
    private List<Watcher> watchers = new ArrayList<>();
}