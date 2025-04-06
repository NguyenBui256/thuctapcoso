package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.dto.ProjectCreateDTO;
import edu.ptit.ttcs.dto.ProjectDTO;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.util.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectDTO>> createProject(
            @RequestBody ProjectCreateDTO projectDTO,
            @RequestHeader("User-Id") Long userId) {
        try {
            ProjectDTO createdProject = projectService.createProject(projectDTO, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Project created successfully", createdProject));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectDTO>> getProject(
            @PathVariable Long projectId,
            @RequestHeader("User-Id") Long userId) {
        try {
            ProjectDTO project = projectService.getProjectById(projectId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Project retrieved successfully", project));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getUserProjects(
            @RequestHeader("User-Id") Long userId) {
        try {
            List<ProjectDTO> projects = projectService.getProjectsByUser(userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "User projects retrieved successfully", projects));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getAllActiveProjects() {
        try {
            List<ProjectDTO> projects = projectService.getAllActiveProjects();
            return ResponseEntity.ok(new ApiResponse<>("success", "All active projects retrieved successfully", projects));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getAllPublicProjects() {
        try {
            List<ProjectDTO> projects = projectService.getAllPublicProjects();
            return ResponseEntity.ok(new ApiResponse<>("success", "All public projects retrieved successfully", projects));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectDTO>> updateProject(
            @PathVariable Long projectId,
            @RequestBody ProjectCreateDTO projectDTO,
            @RequestHeader("User-Id") Long userId) {
        try {
            ProjectDTO updatedProject = projectService.updateProject(projectId, projectDTO, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Project updated successfully", updatedProject));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable Long projectId,
            @RequestHeader("User-Id") Long userId) {
        try {
            projectService.deleteProject(projectId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Project deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @PostMapping("/{projectId}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreProject(
            @PathVariable Long projectId,
            @RequestHeader("User-Id") Long userId) {
        try {
            projectService.restoreProject(projectId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Project restored successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }
} 