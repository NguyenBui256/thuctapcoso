package edu.ptit.ttcs.entity.dto;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private Long issueId;
    private Integer userStoryId;
    private String userStoryName;
    private Long userId;
    private String username;
    private String userFullName;
    private String action;
    private String details;
    private LocalDateTime timestamp;
    private String photoUrl;

    public void validate() {
        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException("Action cannot be null or blank");
        }
        if (timestamp == null) {
            throw new IllegalArgumentException("Timestamp cannot be null");
        }
    }
}