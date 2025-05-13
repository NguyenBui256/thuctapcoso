package edu.ptit.ttcs.entity;

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
     * Add a permission with enabled status
     * @param permission The permission to add
     * @param enabled Whether the permission is enabled
     */
    public void addPermission(Permission permission, boolean enabled) {
        // Kiểm tra xem permission đã tồn tại chưa trước khi thêm mới
        for (ProjectRolePermission prp : rolePermissions) {
            if (prp.getPermission() != null && 
                permission.getId().equals(prp.getPermission().getId())) {
                // Permission đã tồn tại, chỉ cập nhật trạng thái
                prp.setIsEnabled(enabled);
                
                // Đảm bảo permission cũng được thêm vào tập permissions (cho backwards compatibility)
                permissions.add(permission);
                return;
            }
        }
        
        // Nếu chưa tồn tại, thì tạo mới
        ProjectRolePermission rolePermission = new ProjectRolePermission(this, permission);
        rolePermission.setIsEnabled(enabled);
        rolePermissions.add(rolePermission);
        
        // Also maintain the direct relationship for backwards compatibility
        permissions.add(permission);
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
        
        // If we get here, the permission wasn't found, so we should add it
        addPermission(permission, enabled);
        return true;
    }
}