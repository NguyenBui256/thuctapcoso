package edu.ptit.ttcs.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "project")
@Getter
@Setter
public class Project extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String name;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(name = "is_public")
    private Boolean isPublic;

    @Column(name = "logo_url", columnDefinition = "LONGTEXT")
    private String logoUrl;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @OneToMany(mappedBy = "project")
    @JsonManagedReference("project-members")
    private Set<ProjectMember> projectMembers = new HashSet<>();

    @OneToMany(mappedBy = "project")
    private Set<Activity> activities = new HashSet<>();

    @OneToMany(mappedBy = "project")
    private Set<ProjectWikiPage> wikiPages = new HashSet<>();

    @OneToMany(mappedBy = "project")
    private Set<ProjectRole> projectRoles = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "project_module", joinColumns = @JoinColumn(name = "project_id"), inverseJoinColumns = @JoinColumn(name = "module_id"))
    private Set<Module> modules = new HashSet<>();
}