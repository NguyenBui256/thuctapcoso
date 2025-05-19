package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "sprints")
public class Sprint {

    public static final String OPEN = "open";

    public static final String CLOSED = "closed";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String status = OPEN;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private ProjectMember createdBy;

    @Column(nullable = false)
    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "updated_by_id")
    private ProjectMember updatedBy;

    private LocalDateTime updatedDate;

    @OneToMany(mappedBy = "sprint", cascade = CascadeType.ALL)
    private List<UserStory> userStories = new ArrayList<>();

    @OneToMany(mappedBy = "sprint", cascade = CascadeType.ALL)
    private List<Issue> issues = new ArrayList<>();
}