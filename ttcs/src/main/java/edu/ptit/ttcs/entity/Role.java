package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "roles")
@Getter
@Setter
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private boolean active = true;

    @Column
    private String description;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "role")
    private Set<User> users;
}