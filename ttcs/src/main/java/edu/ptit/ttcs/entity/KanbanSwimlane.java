package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kanban_swimlane")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KanbanSwimlane {
    @Id
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
    
    @Column(name = "prior_order")
    private Integer priorOrder;
    
    private String name;
} 