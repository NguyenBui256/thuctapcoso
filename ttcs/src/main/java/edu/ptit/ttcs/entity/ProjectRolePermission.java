package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "project_role_permission")
@Getter
@Setter
public class ProjectRolePermission {

    @EmbeddedId
    private ProjectRolePermissionId id;
    
    @ManyToOne
    @MapsId("projectRoleId")
    @JoinColumn(name = "project_role_id", nullable = false)
    private ProjectRole projectRole;

    @ManyToOne
    @MapsId("permissionId")
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;
    
    // Default constructor
    public ProjectRolePermission() {
        this.id = new ProjectRolePermissionId();
    }
    
    // Constructor with projectRole and permission
    public ProjectRolePermission(ProjectRole projectRole, Permission permission) {
        this.id = new ProjectRolePermissionId(
            projectRole != null ? projectRole.getId() : null,
            permission != null ? permission.getId() : null
        );
        this.projectRole = projectRole;
        this.permission = permission;
    }
    
    // Custom equals and hashCode based on composite key
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProjectRolePermission that = (ProjectRolePermission) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    /**
     * Embedded ID class for composite primary key
     */
    @Embeddable
    @Getter
    @Setter
    public static class ProjectRolePermissionId implements Serializable {
        
        @Column(name = "project_role_id")
        private Long projectRoleId;
        
        @Column(name = "permission_id")
        private Long permissionId;
        
        // Default constructor
        public ProjectRolePermissionId() {
        }
        
        // Constructor with ids
        public ProjectRolePermissionId(Long projectRoleId, Long permissionId) {
            this.projectRoleId = projectRoleId;
            this.permissionId = permissionId;
        }
        
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ProjectRolePermissionId that = (ProjectRolePermissionId) o;
            return Objects.equals(projectRoleId, that.projectRoleId) &&
                   Objects.equals(permissionId, that.permissionId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(projectRoleId, permissionId);
        }
    }
} 