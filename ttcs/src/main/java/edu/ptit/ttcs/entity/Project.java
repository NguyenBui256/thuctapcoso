package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "project")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {
    @Id
    private Integer id;
    
    private String name;
    
    @Column(columnDefinition = "longtext")
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;
    
    @Column(name = "is_public")
    private Boolean isPublic;
    
    @Column(name = "logo_url", columnDefinition = "longtext")
    private String logoUrl;
    
    @Column(name = "is_deleted")
    private Boolean isDeleted;
    
    @ManyToMany
    @JoinTable(
        name = "project_module",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "module_id")
    )
    private Set<Module> modules;
    
    @OneToMany(mappedBy = "project")
    private Set<PjsettingStatus> statuses;
    
    @OneToMany(mappedBy = "project")
    private Set<PjsettingType> types;
    
    @OneToMany(mappedBy = "project")
    private Set<PjsettingTag> tags;
    
    @OneToMany(mappedBy = "project")
    private Set<PjsettingPriority> priorities;
    
    @OneToMany(mappedBy = "project")
    private Set<PjsettingSeverity> severities;
    
    @OneToMany(mappedBy = "project")
    private Set<ProjectRole> roles;
    
    @OneToMany(mappedBy = "project")
    private Set<KanbanSwimlane> swimlanes;
    
    @OneToMany(mappedBy = "project")
    private Set<PjsettingPoint> points;
} 