package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.Permission;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.dto.RestResponse;
import edu.ptit.ttcs.service.PermissionService;
import edu.ptit.ttcs.service.ProjectRoleService;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/roles")
@RequiredArgsConstructor
@Slf4j
public class ProjectRolePermissionController {
    private final ProjectService projectService;
    private final ProjectRoleService projectRoleService;
    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<?> getAllRoles(@PathVariable Long projectId) {
        try {
            if (projectId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("error", "Project ID cannot be null", null));
            }

            Project project = projectService.findById(projectId);
            if (project == null) {
                return ResponseEntity.notFound()
                    .build();
            }

            List<ProjectRole> roles = projectRoleService.getAllRolesByProject(project);
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            log.error("Error fetching roles for project {}", projectId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping("/{roleId}/permissions")
    public ResponseEntity<?> getRolePermissions(
            @PathVariable Long projectId,
            @PathVariable Long roleId) {
        try {
            if (projectId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("error", "Project ID cannot be null", null));
            }
            
            if (roleId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("error", "Role ID cannot be null", null));
            }
            
            Optional<ProjectRole> roleOpt = projectRoleService.findById(roleId);
            if (roleOpt.isEmpty()) {
                return ResponseEntity.notFound()
                    .build();
            }
            
            ProjectRole role = roleOpt.get();
            // Validate role belongs to project
            if (role.getProject() == null || !role.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>("error", "Role does not belong to the specified project", null));
            }
            
            return ResponseEntity.ok(role.getPermissions() != null ? role.getPermissions() : Collections.emptySet());
        } catch (Exception e) {
            log.error("Error fetching permissions for role {}", roleId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @PutMapping("/{roleId}/permissions")
    public ResponseEntity<?> updateRolePermissions(
            @PathVariable Long projectId,
            @PathVariable Long roleId,
            @RequestBody Map<Long, Boolean> permissionUpdates) {
        try {
            if (projectId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("error", "Project ID cannot be null", null));
            }
            
            if (roleId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("error", "Role ID cannot be null", null));
            }
            
            if (permissionUpdates == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("error", "Permission updates cannot be null", null));
            }
            
            Optional<ProjectRole> roleOpt = projectRoleService.findById(roleId);
            if (roleOpt.isEmpty()) {
                return ResponseEntity.notFound()
                    .build();
            }
            
            ProjectRole role = roleOpt.get();
            // Validate role belongs to project
            if (role.getProject() == null || !role.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>("error", "Role does not belong to the specified project", null));
            }
            
            // Process permission updates
            Set<Permission> currentPermissions = role.getPermissions();
            if (currentPermissions == null) {
                currentPermissions = Collections.emptySet();
            }
            
            Set<Long> currentPermissionIds = currentPermissions.stream()
                    .map(Permission::getId)
                    .collect(Collectors.toSet());
            
            // Add permissions
            for (Map.Entry<Long, Boolean> entry : permissionUpdates.entrySet()) {
                Long permissionId = entry.getKey();
                Boolean isEnabled = entry.getValue();
                
                if (permissionId == null) {
                    continue;
                }
                
                if (Boolean.TRUE.equals(isEnabled) && !currentPermissionIds.contains(permissionId)) {
                    Optional<Permission> permissionOpt = permissionService.findById(permissionId);
                    permissionOpt.ifPresent(currentPermissions::add);
                } else if (Boolean.FALSE.equals(isEnabled) && currentPermissionIds.contains(permissionId)) {
                    currentPermissions.removeIf(p -> p.getId().equals(permissionId));
                }
            }
            
            role.setPermissions(currentPermissions);
            ProjectRole updatedRole = projectRoleService.save(role);
            return ResponseEntity.ok(
                new ApiResponse<>("success", "Permissions updated successfully", updatedRole)
            );
        } catch (Exception e) {
            log.error("Error updating permissions for role {}", roleId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping("/permissions")
    public ResponseEntity<?> getAllPermissions() {
        try {
            List<Permission> permissions = permissionService.findAll();
            return ResponseEntity.ok(permissions);
        } catch (Exception e) {
            log.error("Error fetching all permissions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }
} 