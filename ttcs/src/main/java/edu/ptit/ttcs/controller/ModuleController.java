package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.ProjectModule;
import edu.ptit.ttcs.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping("/{projectId}/modules")
    public ResponseEntity<List<ProjectModule>> getProjectModules(@PathVariable Long projectId) {
        return ResponseEntity.ok(moduleService.getProjectModules(projectId));
    }

    @PutMapping("/{projectId}/modules")
    public ResponseEntity<List<ProjectModule>> updateProjectModules(
            @PathVariable Long projectId,
            @RequestBody List<ProjectModule> modules) {
        return ResponseEntity.ok(moduleService.updateProjectModules(projectId, modules));
    }
} 