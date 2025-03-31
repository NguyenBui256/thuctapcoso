package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pjsetting_type")
@Getter
@Setter
public class ProjectSettingType extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "`order`")
    private Integer order;

    @Column(length = 7)
    private String color;

    @Column(length = 100)
    private String name;
}