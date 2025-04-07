package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dto.ProjectRoleDTO;

import java.util.List;

public interface ProjectRoleService {
    
    ProjectRoleDTO createProjectRole(Long projectId, String roleName, List<Long> permissionIds, Long requestUserId);
    
    List<ProjectRoleDTO> getProjectRoles(Long projectId, Long requestUserId);
    
    ProjectRoleDTO getProjectRoleById(Long roleId, Long requestUserId);
    
    ProjectRoleDTO updateProjectRole(Long roleId, String roleName, List<Long> permissionIds, Long requestUserId);
    
    void deleteProjectRole(Long roleId, Long requestUserId);
} 