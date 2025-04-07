package edu.ptit.ttcs.entity.dto;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRoleDTO {
    private Long id;
    private Long projectId;
    private String roleName;
    private List<Long> permissionIds;

    public void validate() {
        if (roleName == null || roleName.isBlank()) {
            throw new IllegalArgumentException("Role name cannot be null or blank");
        }
    }
}