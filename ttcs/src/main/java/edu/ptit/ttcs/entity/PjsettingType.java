package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "pjsetting_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PjsettingType {
    @Id
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
    
    @Column(name = "prior_order")
    private Integer priorOrder;
    
    private String color;
    
    private String name;
    
    @OneToMany(mappedBy = "type")
    private Set<Issue> issues;
} 