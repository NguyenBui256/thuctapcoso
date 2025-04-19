package edu.ptit.ttcs.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pjsetting_status")
@Getter
@Setter
public class ProjectSettingStatus extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    @JsonIgnore
    private Project project;

    @Column(name = "`order`")
    private Integer order;

    @Column(length = 20)
    private String type;

    @Column(length = 7)
    private String color;

    @Column(length = 50)
    private String name;

    private String slug;

    private Boolean closed;

    private Boolean archived;
}