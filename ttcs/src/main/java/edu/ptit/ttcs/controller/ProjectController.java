package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.CreateProjectDTO;
import edu.ptit.ttcs.entity.dto.ProjectDTO;
import edu.ptit.ttcs.entity.dto.PageResponse;
import edu.ptit.ttcs.mapper.ProjectMapper;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;
    private final ProjectMapper projectMapper;

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@RequestBody CreateProjectDTO createProjectDTO) {
        Project project = projectService.createProject(createProjectDTO);
        return ResponseEntity.ok(projectMapper.toDTO(project));
    }

    @PostMapping("/{projectId}/modules/{moduleId}")
    public ResponseEntity<ProjectDTO> addModuleToProject(
            @PathVariable Long projectId,
            @PathVariable Long moduleId) {
        Project updatedProject = projectService.addModuleToProject(projectId, moduleId);
        return ResponseEntity.ok(projectMapper.toDTO(updatedProject));
    }

    @GetMapping
    public ResponseEntity<PageResponse<ProjectDTO>> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(projectService.findAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long id) {
        Project project = projectService.findById(id);
        return ResponseEntity.ok(projectMapper.toDTO(project));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectDTO>> getProjectsByUser(@PathVariable Long userId) {
        User user = userService.findById(userId);
        List<ProjectDTO> projects = projectService.findByOwner(user).stream()
                .map(projectMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(projects);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable Long id,
            @RequestBody CreateProjectDTO updateProjectDTO) {
        Project project = projectService.updateProject(id, updateProjectDTO);
        return ResponseEntity.ok(projectMapper.toDTO(project));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/public")
    public ResponseEntity<PageResponse<ProjectDTO>> getPublicProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(projectService.findPublicProjects(page, size));
    }

    @GetMapping("/duplicate")
    public ResponseEntity<List<ProjectDTO>> getProjectsForDuplication() {
        return ResponseEntity.ok(projectService.findProjectsForDuplication());
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ProjectDTO> duplicateProject(
            @PathVariable Long id,
            @RequestBody CreateProjectDTO projectDTO) {
        Project project = projectService.duplicateProject(id, projectDTO);
        return ResponseEntity.ok(projectMapper.toDTO(project));
    }
}