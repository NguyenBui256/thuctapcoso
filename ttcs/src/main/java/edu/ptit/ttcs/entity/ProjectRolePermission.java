package edu.ptit.ttcs.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;
import java.util.Objects;

@Entity
@Table(name = "project_role_permission")
@Getter
@Setter
public class ProjectRolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "project_role_id", nullable = false)
    @JsonIgnore
    private ProjectRole projectRole;

    @ManyToOne
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;
    
    /**
     * Convert numeric database value to Boolean
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
    
    // Default constructor
    public ProjectRolePermission() {
    }
    
    // Constructor with projectRole and permission
    public ProjectRolePermission(ProjectRole projectRole, Permission permission) {
        this.projectRole = projectRole;
        this.permission = permission;
    }
    
    // Custom equals and hashCode based on id
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
} 