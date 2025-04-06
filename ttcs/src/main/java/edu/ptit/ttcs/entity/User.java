package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "fullname", nullable = false, columnDefinition = "text")
    private String fullName;

    @Column(name = "bio", columnDefinition = "text")
    private String bio;

    @Column(name = "avatar", columnDefinition = "text")
    private String avatar;

    @Column(name = "password", nullable = false, columnDefinition = "text")
    private String password;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

}