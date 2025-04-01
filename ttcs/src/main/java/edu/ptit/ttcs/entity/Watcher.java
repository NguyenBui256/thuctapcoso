package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "watchers")
public class Watcher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "issue_id")
    private Issue issue;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}