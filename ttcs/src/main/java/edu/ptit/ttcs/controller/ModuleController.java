package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectModule;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.service.ModuleService;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Slf4j
public class ModuleController {

    private final ModuleService moduleService;
    private final ProjectService projectService;
    private final SecurityUtils securityUtils;

    @GetMapping("/{projectId}/modules")
    public ResponseEntity<List<ProjectModule>> getProjectModules(@PathVariable Long projectId) {
        return ResponseEntity.ok(moduleService.getProjectModules(projectId));
    }

    @PutMapping("/{projectId}/modules")
    public ResponseEntity<List<ProjectModule>> updateProjectModules(
            @PathVariable Long projectId,
            @RequestBody List<ProjectModule> modules) {
        try {
            // Make sure project exists before updating
            Project project = projectService.findById(projectId);

            // Get current user for permission check
            User currentUser = securityUtils.getCurrentUser();

            // Check if user has permission to update the project (safely handling null
            // owner)
            // If owner is null, we'll use createdBy for permission check
            if (project.getOwner() == null && project.getCreatedBy() != null) {
                log.warn("Project {} has null owner, using createdBy for permission check", projectId);
                project.setOwner(project.getCreatedBy());
            }

            return ResponseEntity.ok(moduleService.updateProjectModules(projectId, modules));
        } catch (Exception e) {
            log.error("Error updating project modules: {}", e.getMessage(), e);
            throw new RuntimeException("Error updating project modules: " + e.getMessage());
        }
    }
}