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
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToMany
    @JoinTable(name = "task_assignee", joinColumns = @JoinColumn(name = "task_id"), inverseJoinColumns = @JoinColumn(name = "project_member_id"))
    private List<ProjectMember> assignees = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_story_id")
    private UserStory userStory;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "is_blocked")
    private Boolean isBlocked;

    @Column(name = "points")
    private Integer points;

    @ManyToMany
    @JoinTable(name = "task_tag", joinColumns = @JoinColumn(name = "id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private List<ProjectSettingTag> tags = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "status_id")
    private ProjectSettingStatus status;

    @ManyToMany
    @JoinTable(name = "task_watcher", joinColumns = @JoinColumn(name = "task_id"), inverseJoinColumns = @JoinColumn(name = "project_member_id"))
    private List<ProjectMember> watchers = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<TaskAttachment> taskAttachments = new ArrayList<>();

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ProjectSettingStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectSettingStatus status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Boolean getIsBlocked() {
        return isBlocked;
    }

    public void setIsBlocked(Boolean isBlocked) {
        this.isBlocked = isBlocked;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public User getUser() {
        return user;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }
}