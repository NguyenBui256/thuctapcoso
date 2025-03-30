package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "pjsetting_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PjsettingStatus {
    @Id
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
    
    @Column(name = "prior_order")
    private Integer priorOrder;
    
    private String type;
    
    private String color;
    
    private String name;
    
    private String slug;
    
    private Boolean closed;
    
    private Boolean archived;
    
    @OneToMany(mappedBy = "status")
    private Set<Issue> issues;
    
    @OneToMany(mappedBy = "status")
    private Set<Task> tasks;
    
    @OneToMany(mappedBy = "status")
    private Set<UserStory> userStories;
} 