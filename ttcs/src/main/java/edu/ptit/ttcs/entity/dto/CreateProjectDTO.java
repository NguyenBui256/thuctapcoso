package edu.ptit.ttcs.entity.dto;

import lombok.Data;

@Data
public class CreateProjectDTO {
    private String name;
    private String description;
    private Boolean isPublic;
    private String logoUrl;
    private String projectType; // "SCRUM" or "KANBAN"
}