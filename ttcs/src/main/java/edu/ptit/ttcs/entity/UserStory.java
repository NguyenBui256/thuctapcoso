package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "user_story")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStory {
    @Id
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;
    
    @Column(nullable = false, columnDefinition = "text")
    private String name;
    
    @Column(columnDefinition = "text")
    private String description;
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    @ManyToOne
    @JoinColumn(name = "status_id")
    private PjsettingStatus status;
    
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
    private Set<Task> tasks;
    
    @ManyToMany(mappedBy = "userStories")
    private Set<PjsettingTag> tags;
    
    @ManyToMany
    @JoinTable(
        name = "user_story_user",
        joinColumns = @JoinColumn(name = "user_story_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> assignedUsers;
    
    @ManyToMany
    @JoinTable(
        name = "user_story_watcher",
        joinColumns = @JoinColumn(name = "user_story_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> watchers;
} 