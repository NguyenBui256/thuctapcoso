package edu.ptit.ttcs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.ptit.ttcs.entity.dto.ProjectRoleDTO;
import edu.ptit.ttcs.entity.dto.ProjectRoleRequestDTO;
import edu.ptit.ttcs.service.ProjectRoleService;
import edu.ptit.ttcs.util.ApiResponse;

@RestController
@RequestMapping("/api/v1/users/{userId}/projects/{projectId}/roles")
public class ProjectRoleController {

    @Autowired
    private ProjectRoleService projectRoleService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectRoleDTO>> createRole(
            @PathVariable Long projectId,
            @RequestBody ProjectRoleRequestDTO request,
            @PathVariable Long userId) {
        try {
            request.validate();

            ProjectRoleDTO role = projectRoleService.createProjectRole(
                    projectId,
                    request.getRoleName(),
                    request.getPermissionIds(),
                    userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Role created successfully", role));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectRoleDTO>>> getProjectRoles(
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        try {
            List<ProjectRoleDTO> roles = projectRoleService.getProjectRoles(projectId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Project roles retrieved successfully", roles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping("/{roleId}")
    public ResponseEntity<ApiResponse<ProjectRoleDTO>> getRole(
            @PathVariable Long projectId,
            @PathVariable Long roleId,
            @PathVariable Long userId) {
        try {
            ProjectRoleDTO role = projectRoleService.getProjectRoleById(roleId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Role retrieved successfully", role));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @PutMapping("/{roleId}")
    public ResponseEntity<ApiResponse<ProjectRoleDTO>> updateRole(
            @PathVariable Long projectId,
            @PathVariable Long roleId,
            @RequestBody ProjectRoleRequestDTO request,
            @PathVariable Long userId) {
        try {
            request.validate();

            ProjectRoleDTO role = projectRoleService.updateProjectRole(
                    roleId,
                    request.getRoleName(),
                    request.getPermissionIds(),
                    userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Role updated successfully", role));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<ApiResponse<Void>> deleteRole(
            @PathVariable Long projectId,
            @PathVariable Long roleId,
            @PathVariable Long userId) {
        try {
            projectRoleService.deleteProjectRole(roleId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Role deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }
}