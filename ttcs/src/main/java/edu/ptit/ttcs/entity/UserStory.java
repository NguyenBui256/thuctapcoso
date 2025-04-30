package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_story")
@Getter
@Setter
public class UserStory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @ManyToOne
    @JoinColumn(name = "status_id")
    private ProjectSettingStatus status;

    @ManyToOne
    @JoinColumn(name = "swimlane_id")
    private KanbanSwimland swimlane;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "is_block")
    private Boolean isBlock;

    @Column(name = "ux_points")
    private Integer uxPoints;

    @Column(name = "back_points")
    private Integer backPoints;

    @Column(name = "front_points")
    private Integer frontPoints;

    @Column(name = "design_points")
    private Integer designPoints;

    @OneToMany(mappedBy = "userStory")
    private Set<Task> tasks = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "user_story_tag", joinColumns = @JoinColumn(name = "id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<ProjectSettingTag> tags = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "user_story_user", joinColumns = @JoinColumn(name = "user_story_id"), inverseJoinColumns = @JoinColumn(name = "project_member_id"))
    private Set<ProjectMember> assignedUsers = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "user_story_watcher", joinColumns = @JoinColumn(name = "user_story_id"), inverseJoinColumns = @JoinColumn(name = "project_member_id"))
    private Set<ProjectMember> watchers = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }
}