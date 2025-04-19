package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "task")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "assigned_member_id")
    private ProjectMember assigned;

    @ManyToOne
    @JoinColumn(name = "user_story_id")
    private UserStory userStory;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @ManyToOne
    @JoinColumn(name = "status_id")
    private ProjectSettingStatus status;

    @ManyToMany
    @JoinTable(name = "task_tag", joinColumns = @JoinColumn(name = "id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private List<ProjectSettingTag> tags = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "task_watcher", joinColumns = @JoinColumn(name = "task_id"), inverseJoinColumns = @JoinColumn(name = "project_member_id"))
    private List<ProjectMember> watchers = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<TaskAttachment> taskAttachments = new ArrayList<>();
}