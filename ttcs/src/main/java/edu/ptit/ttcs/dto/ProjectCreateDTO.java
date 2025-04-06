package edu.ptit.ttcs.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCreateDTO {
    private String name;
    private String description;
    private Boolean isPublic;
    private String logoUrl;

    public void validate() {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Project name cannot be null or blank");
        }
    }
} 