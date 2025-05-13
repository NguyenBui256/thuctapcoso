package edu.ptit.ttcs.entity.dto;

import edu.ptit.ttcs.entity.Permission;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRolePermissionDTO {
    private Long id;
    private Permission permission;
    private Boolean isEnabled;
} 