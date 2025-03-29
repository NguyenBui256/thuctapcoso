package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "project_role")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRole {
    @Id
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
    
    @Column(name = "role_name")
    private String roleName;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToMany
    @JoinTable(
        name = "permission_role",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permissions> permissions;
    
    @OneToMany(mappedBy = "projectRole")
    private Set<ProjectMember> members;
} 