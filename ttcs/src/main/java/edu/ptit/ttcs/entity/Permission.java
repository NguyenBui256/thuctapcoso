package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "permissions")
@Getter
@Setter
public class Permission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "api_path", nullable = false)
    private String apiPath;

    @Column(nullable = false)
    private String method;

    @Column(nullable = false)
    private String module;

    @Column(nullable = false)
    private String name;

    @Column(name ="is_enabled")
    private Boolean isEnabled = true;

    @ManyToMany(mappedBy = "permissions")
    private Set<ProjectRole> projectRoles = new HashSet<>();
}