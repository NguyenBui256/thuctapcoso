package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pjsetting_point")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PjsettingPoint {
    @Id
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
    
    @Column(name = "prior_order")
    private Integer priorOrder;
    
    private String name;
    
    private Float point;
} 