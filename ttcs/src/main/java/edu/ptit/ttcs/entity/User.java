package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private Integer id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false, columnDefinition = "text")
    private String fullname;
    
    @Column(columnDefinition = "text")
    private String bio;
    
    @Column(columnDefinition = "text")
    private String avatar;
    
    @Column(nullable = false, columnDefinition = "text")
    private String password;
    
    @ManyToOne
    @JoinColumn(name = "role_id")
    private Roles role;
} 