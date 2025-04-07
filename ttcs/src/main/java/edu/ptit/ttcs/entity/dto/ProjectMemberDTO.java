package edu.ptit.ttcs.dto;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberDTO {
    private Integer id;
    private Long projectId;
    private Long userId;
    private String username;
    private String userFullName;
    private Long projectRoleId;
    private String roleName;
    private Integer totalPoint;
    private Boolean isAdmin;
    private LocalDateTime joinedAt;

    public void validate() {
        if (projectId == null) {
            throw new IllegalArgumentException("Project ID cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
    }
} 