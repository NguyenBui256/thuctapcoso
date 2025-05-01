package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.CreateProjectDTO;
import edu.ptit.ttcs.entity.dto.PageResponse;
import edu.ptit.ttcs.entity.dto.ProjectDTO;
import edu.ptit.ttcs.entity.dto.ProjectMemberDTO;
import edu.ptit.ttcs.entity.dto.response.PjStatusDTO;
import edu.ptit.ttcs.mapper.ProjectMapper;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.service.ProjectMemberService;
import edu.ptit.ttcs.service.UserService;
import edu.ptit.ttcs.util.ApiResponse;
import edu.ptit.ttcs.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController1 {

    private final ProjectService projectService;
    private final UserService userService;
    private final ProjectMapper projectMapper;
    private final ProjectMemberService projectMemberService;

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody CreateProjectDTO createProjectDTO) {
        // Get current user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.badRequest().build();
        }

        // Get user ID from authentication
        String username = authentication.getName();
        User currentUser = userService.getUserByLogin(username);
        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }

        // Create project with current user as creator
        Project project = projectService.createProject(createProjectDTO, currentUser.getId());
        return ResponseEntity.ok(project);
    }

    @PostMapping("/{projectId}/modules/{moduleId}")
    public ResponseEntity<ProjectDTO> addModuleToProject(
            @PathVariable Long projectId,
            @PathVariable Long moduleId) {
        Project updatedProject = projectService.addModuleToProject(projectId, moduleId);
        return ResponseEntity.ok(projectMapper.toDTO(updatedProject));
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

    @GetMapping
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

    @GetMapping("/get-task-statuses")
    public ResponseEntity<List<PjStatusDTO>> getTaskStatus(@RequestParam long projectId) {
        return ResponseEntity.ok(projectService.getTaskStatuses(projectId));
    }


    @GetMapping("/members/{projectId}")
    public ResponseEntity<List<ProjectMemberDTO>> getProjectMembers(@PathVariable Long projectId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.getUserByLogin(username);
        Long userId = currentUser.getId();

        List<ProjectMemberDTO> members = projectMemberService.getProjectMembers(projectId, userId);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/user/{userId}/projects/member")
    public ResponseEntity<ApiResponse<List<ProjectMemberDTO>>> getUserProjectsAsMember(@PathVariable Long userId) {
        try {
            List<ProjectMemberDTO> projects = projectMemberService.getUserProjects(userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "User projects retrieved successfully", projects));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }
}