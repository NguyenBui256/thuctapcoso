package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    @Column
    private String email;

    @Column
    private String avatar;

    @OneToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @OneToMany(mappedBy = "user")
    private Set<ProjectMember> projectMembers = new HashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<Activity> activities = new HashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<Comment> comments = new HashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<Task> tasks = new HashSet<>();

    @OneToMany(mappedBy = "creator")
    private Set<Attachment> attachments = new HashSet<>();

    @OneToMany(mappedBy = "createdBy")
    private Set<ProjectWikiPage> createdWikiPages = new HashSet<>();

    @OneToMany(mappedBy = "updatedBy")
    private Set<ProjectWikiPage> updatedWikiPages = new HashSet<>();

    @OneToOne(mappedBy = "user")
    private UserSetting userSetting;
}