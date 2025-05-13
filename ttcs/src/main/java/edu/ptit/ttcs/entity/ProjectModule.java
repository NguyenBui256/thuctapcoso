package edu.ptit.ttcs.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "project_module")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="module_id")
    private Module module;

    @Column(name = "is_on", nullable = false)
    private Boolean isOn;

    @ManyToOne
    @JoinColumn(name="project_id")
    @JsonIgnore
    private Project project;
}
