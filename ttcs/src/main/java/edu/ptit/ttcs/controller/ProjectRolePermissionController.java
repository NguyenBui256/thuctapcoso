package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.Permission;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.ProjectRolePermission;
import edu.ptit.ttcs.entity.dto.ProjectRolePermissionDTO;
import edu.ptit.ttcs.entity.dto.RestResponse;
import edu.ptit.ttcs.service.PermissionService;
import edu.ptit.ttcs.service.ProjectRolePermissionService;
import edu.ptit.ttcs.service.ProjectRoleService;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
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
    private final ProjectRolePermissionService projectRolePermissionService;

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
            
            // Return only enabled permissions
            return ResponseEntity.ok(role.getEnabledPermissions());
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
            
            log.info("Updating permissions for role {}: {}", roleId, permissionUpdates);
            
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
            
            // Process permission updates with enabled/disabled status
            for (Map.Entry<Long, Boolean> entry : permissionUpdates.entrySet()) {
                Long permissionId = entry.getKey();
                Boolean isEnabled = entry.getValue();
                
                if (permissionId == null) {
                    log.warn("Skipping null permission ID");
                    continue;
                }
                
                log.debug("Processing permission {}: isEnabled={}", permissionId, isEnabled);
                
                Optional<Permission> permissionOpt = permissionService.findById(permissionId);
                if (permissionOpt.isEmpty()) {
                    log.warn("Permission not found: {}", permissionId);
                    continue;
                }
                
                Permission permission = permissionOpt.get();
                
                try {
                    // Check if this permission is already associated with the role
                    Optional<ProjectRolePermission> existingPrpOpt = 
                        projectRolePermissionService.findByProjectRoleAndPermission(role, permission);
                    
                    if (existingPrpOpt.isPresent()) {
                        // Update existing relationship
                        ProjectRolePermission prp = existingPrpOpt.get();
                        prp.setIsEnabled(isEnabled);
                        log.debug("Updating existing permission {}: {}", permissionId, isEnabled);
                        projectRolePermissionService.save(prp);
                    } else {
                        // Create new relationship using the safer setPermissionEnabled method
                        throw new RuntimeException("Permission not found: " + permissionId);
                    }
                } catch (Exception e) {
                    log.error("Error processing permission {}: {}", permissionId, e.getMessage(), e);
                }
            }
            
            ProjectRole updatedRole = projectRoleService.save(role);
            return ResponseEntity.ok(
                new ApiResponse<>("success", "Permissions updated successfully", updatedRole.getEnabledPermissions())
            );
        } catch (Exception e) {
            log.error("Error updating permissions for role {}: {}", roleId, e.getMessage(), e);
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

    @GetMapping("/{roleId}/permissions/status")
    public ResponseEntity<?> getRolePermissionsWithStatus(
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
            
            // Fetch all permissions with their enabled status from the join table
            List<ProjectRolePermission> rolePermissions = 
                projectRolePermissionService.findByProjectRoleId(roleId);
            
            log.info("Found {} role permissions for role {}", rolePermissions.size(), roleId);
            
            // Debug log to inspect isEnabled values
            rolePermissions.forEach(prp -> {
                log.info("Permission ID: {}, isEnabled: {}, isEnabled class: {}", 
                    prp.getPermission().getId(), 
                    prp.getIsEnabled(),
                    prp.getIsEnabled() != null ? prp.getIsEnabled().getClass().getName() : "null");
            });
            
            // Convert to DTOs with full permission details
            List<ProjectRolePermissionDTO> permissionDTOs = rolePermissions.stream()
                .map(prp -> {
                    ProjectRolePermissionDTO dto = new ProjectRolePermissionDTO();
                    dto.setId(prp.getId());
                    dto.setProjectRoleId(prp.getProjectRole().getId());
                    dto.setPermissionId(prp.getPermission().getId());
                    dto.setPermission(prp.getPermission());
                    
                    Boolean isEnabled = prp.getIsEnabled();
                    log.info("Setting isEnabled for DTO: {}", isEnabled);
                    dto.setIsEnabled(isEnabled);
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(new ApiResponse<>("success", "Permissions retrieved successfully", permissionDTOs));
        } catch (Exception e) {
            log.error("Error fetching permissions with status for role {}: {}", roleId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }
    
    @GetMapping("/{roleId}/permissions/all")
    public ResponseEntity<?> getAllRolePermissions(
            @PathVariable Long projectId,
            @PathVariable Long roleId) {
        try {
            if (projectId == null || roleId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("error", "Project ID and Role ID cannot be null", null));
            }
            
            // Debug raw data from database
            log.info("Debug raw data from database for role: {}", roleId);
            projectRolePermissionService.debugRawData(roleId);
            
            Optional<ProjectRole> roleOpt = projectRoleService.findById(roleId);
            if (roleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectRole role = roleOpt.get();
            if (role.getProject() == null || !role.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>("error", "Role does not belong to the specified project", null));
            }
            
            // Get all available permissions
            List<Permission> allPermissions = permissionService.findAll();
            
            // Get existing role permissions (with status)
            List<ProjectRolePermission> existingRolePermissions = 
                projectRolePermissionService.findByProjectRoleId(roleId);
            
            log.info("Found {} existing role permissions for role {}", existingRolePermissions.size(), roleId);
            for(ProjectRolePermission p : existingRolePermissions) {
                log.warn("{} - {}", p.getId(), p.getPermission().getId());
            }

            // Create a map for quick lookup
            Map<Long, ProjectRolePermission> permissionMap = existingRolePermissions.stream()
                .collect(Collectors.toMap(
                    prp -> prp.getPermission().getId(),
                    prp -> prp
                ));

            // Create DTOs for all permissions (existing and non-existing)
            List<ProjectRolePermissionDTO> allPermissionDTOs = new ArrayList<>();
            
            for (Permission permission : allPermissions) {
                ProjectRolePermissionDTO dto = new ProjectRolePermissionDTO();
                ProjectRolePermission existingPrp = permissionMap.get(permission.getId());
                
                if (existingPrp != null) {
                    // Using existing ProjectRolePermission ID
                    dto.setId(existingPrp.getId());
                    dto.setProjectRoleId(roleId);
                    dto.setPermissionId(permission.getId());
                    dto.setPermission(permission);
                    
                    Boolean isEnabled = existingPrp.getIsEnabled();
                    log.info("Setting isEnabled for existing permission {}: {}", permission.getId(), isEnabled);
                    dto.setIsEnabled(isEnabled);
                } else {
                    // This is a permission not yet associated with the role
                    // Nên không xảy ra trường hợp này nữa vì đã tạo tất cả quyền mặc định ở trên
                    dto.setId(null); // No ID yet, will be created if enabled
                    dto.setProjectRoleId(roleId);
                    dto.setPermissionId(permission.getId());
                    dto.setPermission(permission);
                    dto.setIsEnabled(false);
                    
                    log.warn("Permission {} not found in map for role {} even after creating default permissions", 
                        permission.getId(), roleId);
                }
                
                allPermissionDTOs.add(dto);
            }
            
            return ResponseEntity.ok(
                new ApiResponse<>("success", "All permissions retrieved successfully", allPermissionDTOs)
            );
        } catch (Exception e) {
            log.error("Error fetching all permissions for role {}: {}", roleId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }
    
    @PutMapping("/{roleId}/permission/{permissionId}")
    public ResponseEntity<?> updateSinglePermission(
            @PathVariable Long projectId,
            @PathVariable Long roleId,
            @PathVariable Long permissionId,
            @RequestBody Map<String, Boolean> updateRequest) {
        try {
            if (projectId == null || roleId == null || permissionId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("error", "Project ID, Role ID, and Permission ID cannot be null", null));
            }
            
            Boolean isEnabled = updateRequest.get("isEnabled");
            if (isEnabled == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("error", "isEnabled value must be provided", null));
            }
            
            log.info("Updating permission {} for role {}: isEnabled={}", permissionId, roleId, isEnabled);
            
            Optional<ProjectRole> roleOpt = projectRoleService.findById(roleId);
            if (roleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectRole role = roleOpt.get();
            if (role.getProject() == null || !role.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>("error", "Role does not belong to the specified project", null));
            }
            
            Optional<Permission> permissionOpt = permissionService.findById(permissionId);
            if (permissionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Permission permission = permissionOpt.get();
            
            // Check if relationship exists
            Optional<ProjectRolePermission> existingPrpOpt = 
                projectRolePermissionService.findByProjectRoleAndPermission(role, permission);
            
            ProjectRolePermission prp;
            if (existingPrpOpt.isPresent()) {
                // Update existing
                prp = existingPrpOpt.get();
                prp.setIsEnabled(isEnabled);
            } else {
                // Create new
                prp = new ProjectRolePermission(role, permission);
                prp.setIsEnabled(isEnabled);
            }
            
            prp = projectRolePermissionService.save(prp);
            
            // Create response DTO
            ProjectRolePermissionDTO dto = new ProjectRolePermissionDTO();
            dto.setId(prp.getId());
            dto.setProjectRoleId(roleId);
            dto.setPermissionId(permissionId);
            dto.setPermission(permission);
            dto.setIsEnabled(isEnabled);
            
            return ResponseEntity.ok(
                new ApiResponse<>("success", "Permission updated successfully", dto)
            );
        } catch (Exception e) {
            log.error("Error updating permission {} for role {}: {}", permissionId, roleId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }
} 