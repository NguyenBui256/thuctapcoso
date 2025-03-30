package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "pjsetting_priority")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PjsettingPriority {
    @Id
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
    
    @Column(name = "prior_order")
    private Integer priorOrder;
    
    private String color;
    
    private String name;
    
    @OneToMany(mappedBy = "priority")
    private Set<Issue> issues;
} 