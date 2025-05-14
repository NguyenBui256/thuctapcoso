package edu.ptit.ttcs.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "project_role")
@Getter
@Setter
@RequiredArgsConstructor
public class ProjectRole extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    @JsonIgnore
    private Project project;

    @Column(name = "role_name")
    private String roleName;

    @OneToMany(mappedBy = "projectRole")
    @JsonManagedReference("role-members")
    private Set<ProjectMember> projectMembers = new HashSet<>();

    // Direct ManyToMany relationship - kept for backwards compatibility
    @ManyToMany
    @JoinTable(name = "project_role_permission", 
               joinColumns = @JoinColumn(name = "project_role_id"), 
               inverseJoinColumns = @JoinColumn(name = "permission_id"))
    private Set<Permission> permissions = new HashSet<>();
    
    // OneToMany to the join entity with the isEnabled flag
    @OneToMany(mappedBy = "projectRole", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProjectRolePermission> rolePermissions = new HashSet<>();
    
    /**
     * Helper method to get only enabled permissions
     * @return Set of enabled permissions
     */
    @Transient
    public Set<Permission> getEnabledPermissions() {
        Set<Permission> enabledPermissions = new HashSet<>();
        for (ProjectRolePermission prp : rolePermissions) {
            if (prp.getIsEnabled()) {
                enabledPermissions.add(prp.getPermission());
            }
        }
        return enabledPermissions;
    }
    
    /**
     * Set the enabled status for an existing permission
     * @param permission The permission to update
     * @param enabled The new enabled status
     * @return true if the permission was found and updated, false otherwise
     */
    public boolean setPermissionEnabled(Permission permission, boolean enabled) {
        if (permission == null) return false;
        
        for (ProjectRolePermission prp : rolePermissions) {
            if (prp.getPermission() != null && 
                permission.getId().equals(prp.getPermission().getId())) {
                prp.setIsEnabled(enabled);
                return true;
            }
        }
        return true;
    }
}