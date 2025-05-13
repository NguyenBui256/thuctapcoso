package edu.ptit.ttcs.service;

import java.util.List;
import java.util.Optional;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.dto.ProjectRoleDTO;

public interface ProjectRoleService {

    ProjectRoleDTO createProjectRole(Long projectId, String roleName, List<Long> permissionIds, Long requestUserId);

    List<ProjectRoleDTO> getProjectRoles(Long projectId, Long requestUserId);

    ProjectRoleDTO getProjectRoleById(Long roleId, Long requestUserId);

    ProjectRoleDTO updateProjectRole(Long roleId, String roleName, List<Long> permissionIds, Long requestUserId);

    void deleteProjectRole(Long roleId, Long requestUserId);
    
    // New methods for permissions management
    List<ProjectRole> getAllRolesByProject(Project project);
    
    Optional<ProjectRole> findById(Long id);
    
    ProjectRole save(ProjectRole role);
    
    /**
     * Initialize default permissions for a role based on the role name
     * @param role The role to initialize permissions for
     * @return The role with initialized permissions
     */
    ProjectRole initializeRolePermissions(ProjectRole role);
}