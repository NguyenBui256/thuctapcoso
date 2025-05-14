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
    private Long projectRoleId;
    private Long permissionId;
    private Permission permission;
    private Boolean isEnabled;
    
    /**
     * Ensure non-null boolean value
     * @return true if enabled, false otherwise
     */
    public Boolean getIsEnabled() {
        return isEnabled != null && isEnabled;
    }
    
    /**
     * Set enabled status
     * @param enabled the enabled status
     */
    public void setIsEnabled(Boolean enabled) {
        this.isEnabled = enabled != null && enabled;
    }
} 