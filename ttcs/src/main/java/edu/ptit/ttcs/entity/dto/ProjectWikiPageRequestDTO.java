package edu.ptit.ttcs.entity.dto;

import lombok.Data;

@Data
public class ProjectWikiPageRequestDTO {
    private String title;
    private String content;
    
    public void validate() throws IllegalArgumentException {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }
    }
} 