package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "pjsetting_tag")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PjsettingTag {
    @Id
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
    
    @Column(name = "prior_order")
    private Integer priorOrder;
    
    private String color;
    
    private String name;
    
    @ManyToMany(mappedBy = "tags")
    private Set<Issue> issues;
    
    @ManyToMany
    @JoinTable(
        name = "task_tag",
        joinColumns = @JoinColumn(name = "tag_id"),
        inverseJoinColumns = @JoinColumn(name = "id")
    )
    private Set<Task> tasks;
    
    @ManyToMany
    @JoinTable(
        name = "user_story_tag",
        joinColumns = @JoinColumn(name = "tag_id"),
        inverseJoinColumns = @JoinColumn(name = "id")
    )
    private Set<UserStory> userStories;
} 