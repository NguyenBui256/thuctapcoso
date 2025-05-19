package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.dao.ProjectMemberRepository;
import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.dao.ProjectRoleRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.enums.ProjectRoleName;
import edu.ptit.ttcs.service.EmailService;
import edu.ptit.ttcs.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Slf4j
public class ProjectContactController {

        private final ProjectRepository projectRepository;
        private final ProjectRoleRepository projectRoleRepository;
        private final ProjectMemberRepository projectMemberRepository;
        private final UserRepository userRepository;
        private final EmailService emailService;

        /**
         * Endpoint to contact project managers
         * 
         * @param projectId   Project ID
         * @param requestBody Request body containing message
         * @return Response with success/error message
         */
        @PostMapping("/{projectId}/contact")
        public ResponseEntity<ApiResponse<String>> contactProject(
                        @PathVariable Long projectId,
                        @RequestBody Map<String, String> requestBody) {

                try {
                        // Get current user
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                        String username = authentication.getName();
                        User currentUser = userRepository.findByUsernameOrEmail(username)
                                        .orElseThrow(() -> new IllegalArgumentException("User not found"));

                        // Validate input
                        if (!requestBody.containsKey("message") || requestBody.get("message").trim().isEmpty()) {
                                return ResponseEntity.badRequest()
                                                .body(new ApiResponse<>("error", "Message is required", null));
                        }

                        // Find project
                        Project project = projectRepository.findById(projectId)
                                        .orElseThrow(() -> new IllegalArgumentException("Project not found"));

                        // Find Project Managers
                        ProjectRole managerRole = projectRoleRepository
                                        .findByProjectAndRoleName(project, ProjectRoleName.PROJECT_MANAGER.name())
                                        .orElseThrow(() -> new IllegalArgumentException(
                                                        "Project manager role not found"));

                        List<ProjectMember> projectManagers = projectMemberRepository.findByProjectAndProjectRole(
                                        project,
                                        managerRole);

                        if (projectManagers.isEmpty()) {
                                // If no specific project managers, send to project admin/owner
                                projectManagers = projectMemberRepository.findByProjectAndIsAdmin(project, true);

                                if (projectManagers.isEmpty()) {
                                        return ResponseEntity.badRequest()
                                                        .body(new ApiResponse<>("error",
                                                                        "No project managers or admins found", null));
                                }
                        }

                        // Get email addresses of all managers
                        List<String> managerEmails = projectManagers.stream()
                                        .map(member -> member.getUser().getEmail())
                                        .filter(email -> email != null && !email.isEmpty())
                                        .collect(Collectors.toList());

                        if (managerEmails.isEmpty()) {
                                return ResponseEntity.badRequest()
                                                .body(new ApiResponse<>("error", "No manager email addresses found",
                                                                null));
                        }

                        // Prepare template variables
                        Map<String, Object> templateVariables = new HashMap<>();
                        templateVariables.put("projectName", project.getName());
                        templateVariables.put("senderName",
                                        currentUser.getFullName() != null ? currentUser.getFullName()
                                                        : currentUser.getUsername());
                        templateVariables.put("message", requestBody.get("message"));
                        templateVariables.put("currentTime",
                                        LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                        templateVariables.put("projectUrl", "http://localhost:5173/projects/" + projectId);

                        // Send email to all managers using template
                        String subject = "Liên hệ từ " + currentUser.getFullName() + " về dự án: " + project.getName();

                        for (String email : managerEmails) {
                                emailService.sendTemplateMessage(email, subject, "project-contact.html",
                                                templateVariables);
                        }

                        // Return success response
                        return ResponseEntity.ok(new ApiResponse<>("success", "Message sent successfully", null));

                } catch (Exception e) {
                        log.error("Error contacting project managers: {}", e.getMessage(), e);
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>("error", "Failed to send message: " + e.getMessage(),
                                                        null));
                }
        }
}