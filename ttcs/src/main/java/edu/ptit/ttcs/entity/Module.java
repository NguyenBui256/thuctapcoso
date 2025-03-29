package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "module")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Module {
    @Id
    private Integer id;
    
    private String name;
    
    @Column(columnDefinition = "longtext")
    private String description;
} 