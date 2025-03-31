package edu.ptit.ttcs.entity;

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
    private Project project;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "project_role_id")
    private ProjectRole projectRole;

    @Column(name = "total_point")
    private Integer totalPoint;

    @Column(name = "is_admin")
    private Boolean isAdmin;

    @Column(name = "is_delete")
    private Boolean isDelete;
}