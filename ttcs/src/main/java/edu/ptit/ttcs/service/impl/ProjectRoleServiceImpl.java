package edu.ptit.ttcs.service.impl;

import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.dao.ProjectRoleRepository;
import edu.ptit.ttcs.entity.Permission;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.dto.ProjectRoleDTO;
import edu.ptit.ttcs.service.ActivityService;
import edu.ptit.ttcs.service.ProjectRoleService;
import edu.ptit.ttcs.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectRoleServiceImpl implements ProjectRoleService {

        private final ProjectRepository projectRepository;
        private final ProjectRoleRepository projectRoleRepository;
        private final ProjectService projectService;
        private final ActivityService activityService;

        @Override
        @Transactional
        public ProjectRoleDTO createProjectRole(Long projectId, String roleName, List<Long> permissionIds,
                        Long requestUserId) {
                // Check if requester is admin
                if (!projectService.isUserProjectAdmin(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to create project roles");
                }

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

                ProjectRole projectRole = new ProjectRole();
                projectRole.setProject(project);
                projectRole.setName(roleName);
                projectRole.setCreatedAt(LocalDateTime.now());
                projectRole.setUpdatedAt(LocalDateTime.now());

                // Set permissions if provided
                if (permissionIds != null && !permissionIds.isEmpty()) {
                        Set<Permission> permissions = new HashSet<>();
                        for (Long permissionId : permissionIds) {
                                Permission permission = new Permission();
                                permission.setId(permissionId);
                                permissions.add(permission);
                        }
                        projectRole.setPermissions(permissions);
                }

                ProjectRole savedRole = projectRoleRepository.save(projectRole);

                // Record activity
                activityService.recordActivity(
                                projectId,
                                null,
                                requestUserId,
                                "CREATE_ROLE",
                                "Created role: " + roleName);

                return mapToDTO(savedRole);
        }

        @Override
        public List<ProjectRoleDTO> getProjectRoles(Long projectId, Long requestUserId) {
                // Check if requester has access to project
                if (!projectService.isUserProjectMember(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to view project roles");
                }

                List<ProjectRole> roles = projectRoleRepository.findByProjectId(projectId);
                return roles.stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());
        }

        @Override
        public ProjectRoleDTO getProjectRoleById(Long roleId, Long requestUserId) {
                ProjectRole role = projectRoleRepository.findById(roleId)
                                .orElseThrow(() -> new IllegalArgumentException("Project role not found"));

                Long projectId = role.getProject().getId();

                // Check if requester has access to project
                if (!projectService.isUserProjectMember(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to view this role");
                }

                return mapToDTO(role);
        }

        @Override
        @Transactional
        public ProjectRoleDTO updateProjectRole(Long roleId, String roleName, List<Long> permissionIds,
                        Long requestUserId) {
                ProjectRole role = projectRoleRepository.findById(roleId)
                                .orElseThrow(() -> new IllegalArgumentException("Project role not found"));

                Long projectId = role.getProject().getId();

                // Check if requester is admin
                if (!projectService.isUserProjectAdmin(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to update project roles");
                }

                role.setName(roleName);
                role.setUpdatedAt(LocalDateTime.now());

                // Update permissions if provided
                if (permissionIds != null) {
                        Set<Permission> permissions = new HashSet<>();
                        for (Long permissionId : permissionIds) {
                                Permission permission = new Permission();
                                permission.setId(permissionId);
                                permissions.add(permission);
                        }
                        role.setPermissions(permissions);
                }

                ProjectRole updatedRole = projectRoleRepository.save(role);

                // Record activity
                activityService.recordActivity(
                                projectId,
                                null,
                                requestUserId,
                                "UPDATE_ROLE",
                                "Updated role: " + roleName);

                return mapToDTO(updatedRole);
        }

        @Override
        @Transactional
        public void deleteProjectRole(Long roleId, Long requestUserId) {
                ProjectRole role = projectRoleRepository.findById(roleId)
                                .orElseThrow(() -> new IllegalArgumentException("Project role not found"));

                Long projectId = role.getProject().getId();

                // Check if requester is admin
                if (!projectService.isUserProjectAdmin(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to delete project roles");
                }

                // Check if role is in use by project members
                if (!role.getProjectMembers().isEmpty()) {
                        throw new IllegalArgumentException("Cannot delete role as it is assigned to project members");
                }

                projectRoleRepository.delete(role);

                // Record activity
                activityService.recordActivity(
                                projectId,
                                null,
                                requestUserId,
                                "DELETE_ROLE",
                                "Deleted role: " + role.getName());
        }

        private ProjectRoleDTO mapToDTO(ProjectRole role) {
                List<Long> permissionIds = role.getPermissions().stream()
                                .map(Permission::getId)
                                .collect(Collectors.toList());

                ProjectRoleDTO dto = new ProjectRoleDTO();
                dto.setId(role.getId());
                dto.setProjectId(role.getProject() != null ? role.getProject().getId() : null);
                dto.setRoleName(role.getName());
                dto.setPermissionIds(permissionIds);
                return dto;
        }
}