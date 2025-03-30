package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "task")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "user_story_id")
    private UserStory userStory;
    
    @Column(nullable = false, columnDefinition = "text")
    private String name;
    
    @Column(columnDefinition = "text")
    private String description;
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    @ManyToOne
    @JoinColumn(name = "status_id")
    private PjsettingStatus status;
    
    @OneToMany(mappedBy = "task")
    private Set<Comment> comments;
    
    @ManyToMany(mappedBy = "tasks")
    private Set<PjsettingTag> tags;
    
    @ManyToMany
    @JoinTable(
        name = "task_watcher",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> watchers;
    
    @ManyToMany
    @JoinTable(
        name = "task_attachment",
        joinColumns = @JoinColumn(name = "id"),
        inverseJoinColumns = @JoinColumn(name = "attachment_id")
    )
    private Set<Attachment> attachments;
} 