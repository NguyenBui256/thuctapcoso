package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "kanban_task")
@Getter
@Setter
public class KanbanTask extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "task_number")
    private Integer taskNumber;

    @Column
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "`order`")
    private Integer order;

    @Column(name = "status")
    private String status; // NEW, READY, IN_PROGRESS, READY_FOR_REVIEW, DONE

    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne
    @JoinColumn(name = "swimland_id")
    private KanbanSwimland swimland;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "due_date")
    private java.util.Date dueDate;

    @Column(name = "priority")
    private Integer priority; // Độ ưu tiên của task
}