package edu.ptit.ttcs.entity.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserStoryResponseDTO {

    private Integer id;
    private String name;
    private String description;
    private Integer statusId;
    private Integer swimlaneId;
    private Long projectId;
    private Integer uxPoints;
    private Integer backPoints;
    private Integer frontPoints;
    private Integer designPoints;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private String createdByUsername;
    private String createdByFullName;
    private Long assignedUserId;

    // Rename the field to avoid Lombok issues
    private Boolean isBlocked;

    // Manual getters and setters for the blocked field
    public Boolean getBlocked() {
        return isBlocked;
    }

    public void setBlocked(Boolean blocked) {
        this.isBlocked = blocked;
    }
}