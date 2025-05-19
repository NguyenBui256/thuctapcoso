package edu.ptit.ttcs.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "project_member")
@Getter
@Setter
public class ProjectMember extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    @JsonBackReference("project-members")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "project_role_id")
    @JsonBackReference("role-members")
    private ProjectRole projectRole;

    @Column(name = "total_point")
    private Integer totalPoint = 0;

    @Column(name = "is_admin")
    private Boolean isAdmin = false;

    @Column(name = "is_delete")
    private Boolean isDelete = false;
}