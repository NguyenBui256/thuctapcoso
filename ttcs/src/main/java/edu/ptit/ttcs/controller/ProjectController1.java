package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.CreateProjectDTO;
import edu.ptit.ttcs.entity.dto.PageResponse;
import edu.ptit.ttcs.entity.dto.ProjectDTO;
import edu.ptit.ttcs.entity.dto.ProjectMemberDTO;
import edu.ptit.ttcs.entity.dto.response.PjStatusDTO;
import edu.ptit.ttcs.mapper.ProjectMapper;
import edu.ptit.ttcs.service.ProjectMemberService;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.service.UserService;
import edu.ptit.ttcs.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import edu.ptit.ttcs.util.SecurityUtils;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Slf4j
public class ProjectController1 {

    private final ProjectService projectService;
    private final UserService userService;
    private final ProjectMapper projectMapper;
    private final ProjectMemberService projectMemberService;
    private final SecurityUtils securityUtils;

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
    public ResponseEntity<ApiResponse<ProjectDTO>> getProjectById(@PathVariable Long id) {
        try {
            Project project = projectService.findById(id);
            if (project == null) {
                return ResponseEntity.notFound().build();
            }

            // Get current user
            User currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>("error", "User not authenticated", null));
            }

            Long userId = currentUser.getId();

            // Check if user is a project member
            boolean isMember = projectService.isUserProjectMember(id, userId);
            if (!isMember) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("error", "You do not have access to this project", null));
            }

            ProjectDTO projectDTO = projectMapper.toDTO(project);
            return ResponseEntity.ok(new ApiResponse<>("success", "Project retrieved successfully", projectDTO));
        } catch (Exception e) {
            log.error("Error fetching project by ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("error", e.getMessage(), null));
        }
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

        // Verify user has permission to update project
        Project project = projectService.findById(id);
        if (project == null || !project.getOwner().getId().equals(currentUser.getId())) {
            return ResponseEntity.badRequest().build();
        }

        Project updatedProject = projectService.updateProject(id, updateProjectDTO);
        return ResponseEntity.ok(projectMapper.toDTO(updatedProject));
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

    @GetMapping("/assigned")
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getAssignedProjects() {
        try {
            // Get current user from SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>("error", "User not authenticated", null));
            }

            // Get user ID from authentication
            String username = authentication.getName();
            User currentUser = userService.getUserByLogin(username);
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(new ApiResponse<>("error", "User not found", null));
            }

            List<ProjectDTO> projects = projectService.findAssignedProjects(currentUser.getId());
            return ResponseEntity
                    .ok(new ApiResponse<>("success", "Assigned projects retrieved successfully", projects));
        } catch (Exception e) {
            log.error("Error getting assigned projects: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping("/watched")
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getWatchedProjects() {
        try {
            // Get current user from SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>("error", "User not authenticated", null));
            }

            // Get user ID from authentication
            String username = authentication.getName();
            User currentUser = userService.getUserByLogin(username);
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(new ApiResponse<>("error", "User not found", null));
            }

            List<ProjectDTO> projects = projectService.findWatchedProjects(currentUser.getId());
            return ResponseEntity.ok(new ApiResponse<>("success", "Watched projects retrieved successfully", projects));
        } catch (Exception e) {
            log.error("Error getting watched projects: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping("/joined")
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getJoinedProjects() {
        try {
            // Get current user from SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>("error", "User not authenticated", null));
            }

            // Get user ID from authentication
            String username = authentication.getName();
            User currentUser = userService.getUserByLogin(username);
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(new ApiResponse<>("error", "User not found", null));
            }

            List<ProjectDTO> projects = projectService.findJoinedProjects(currentUser.getId());
            return ResponseEntity.ok(new ApiResponse<>("success", "Joined projects retrieved successfully", projects));
        } catch (Exception e) {
            log.error("Error getting joined projects: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping("/{projectId}/check-membership")
    public ResponseEntity<ApiResponse<Boolean>> checkProjectMembership(
            @PathVariable Long projectId) {
        try {
            User user = securityUtils.getCurrentUser();
            if (user == null) {
                log.warn("No authenticated user found via SecurityUtils");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>("error", "User not authenticated", false));
            }

            Long userId = user.getId();
            log.info("Checking membership for project {} and user {}", projectId, userId);

            // Check if user is a project member
            boolean isMember = projectService.isUserProjectMember(projectId, userId);
            log.info("Membership check result for user {} in project {}: {}", userId, projectId, isMember);

            if (isMember) {
                return ResponseEntity.ok(new ApiResponse<>("success", "User is a project member", true));
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("error", "User is not a project member", false));
            }
        } catch (Exception e) {
            log.error("Error checking project membership for project {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("error", e.getMessage(), false));
        }
    }
}