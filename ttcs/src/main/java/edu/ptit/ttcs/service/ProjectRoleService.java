package edu.ptit.ttcs.service;

import java.util.List;

import edu.ptit.ttcs.entity.dto.ProjectRoleDTO;

public interface ProjectRoleService {

    ProjectRoleDTO createProjectRole(Long projectId, String roleName, List<Long> permissionIds, Long requestUserId);

    List<ProjectRoleDTO> getProjectRoles(Long projectId, Long requestUserId);

    ProjectRoleDTO getProjectRoleById(Long roleId, Long requestUserId);

    ProjectRoleDTO updateProjectRole(Long roleId, String roleName, List<Long> permissionIds, Long requestUserId);

    void deleteProjectRole(Long roleId, Long requestUserId);
}