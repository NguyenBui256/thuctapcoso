package edu.ptit.ttcs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberRequestDTO {
    private Long userId;
    private Long roleId;
    private Boolean isAdmin = false;
    
    public void validate() {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
    }
} 