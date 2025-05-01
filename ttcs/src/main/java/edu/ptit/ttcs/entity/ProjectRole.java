package edu.ptit.ttcs.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "project_role")
@Getter
@Setter
@RequiredArgsConstructor
public class ProjectRole extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "role_name")
    private String roleName;

    @OneToMany(mappedBy = "projectRole")
    @JsonManagedReference("role-members")
    private Set<ProjectMember> projectMembers = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "project_role_permission", joinColumns = @JoinColumn(name = "project_role_id"), inverseJoinColumns = @JoinColumn(name = "permission_id"))
    private Set<Permission> permissions = new HashSet<>();
}