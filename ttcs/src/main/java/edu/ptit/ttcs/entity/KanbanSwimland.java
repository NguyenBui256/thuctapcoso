package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Entity
@Table(name = "kanban_swimland")
@Getter
@Setter
public class KanbanSwimland extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "`order`")
    private Integer order;

    @Column(length = 100)
    private String name;

    @Column(name = "status")
    private String status; // NEW, READY, IN_PROGRESS, READY_FOR_REVIEW, DONE

    @OneToMany(mappedBy = "swimland", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<KanbanTask> tasks;

}
