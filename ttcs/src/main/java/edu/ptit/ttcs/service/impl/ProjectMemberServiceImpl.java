package edu.ptit.ttcs.service.impl;

import edu.ptit.ttcs.dao.ProjectMemberRepository;
import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.dao.ProjectRoleRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.ProjectMemberDTO;
import edu.ptit.ttcs.service.ActivityService;
import edu.ptit.ttcs.service.ProjectMemberService;
import edu.ptit.ttcs.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectMemberServiceImpl implements ProjectMemberService {

        @Autowired
        private ProjectRepository projectRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private ProjectMemberRepository projectMemberRepository;

        @Autowired
        private ProjectRoleRepository projectRoleRepository;

        @Autowired
        private ProjectService projectService;

        @Autowired
        private ActivityService activityService;

        @Override
        @Transactional
        public ProjectMemberDTO addMemberToProject(Long projectId, Long userId, Long roleId, Boolean isAdmin,
                        Long requestUserId) {
                // Check if requester is admin
                if (!projectService.isUserProjectAdmin(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to add members to this project");
                }

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                // Check if already a member
                if (projectMemberRepository.existsByProjectAndUserAndIsDeleteFalse(project, user)) {
                        throw new IllegalArgumentException("User is already a member of this project");
                }

                ProjectRole projectRole = null;
                if (roleId != null) {
                        projectRole = projectRoleRepository.findById(roleId)
                                        .orElseThrow(() -> new IllegalArgumentException("Project role not found"));

                        // Check if role belongs to the project
                        if (!projectRole.getProject().getId().equals(projectId)) {
                                throw new IllegalArgumentException("Role does not belong to this project");
                        }
                }

                ProjectMember projectMember = new ProjectMember();
                projectMember.setProject(project);
                projectMember.setUser(user);
                projectMember.setProjectRole(projectRole);
                projectMember.setTotalPoint(0);
                projectMember.setIsAdmin(isAdmin != null ? isAdmin : false);
                projectMember.setIsDelete(false);
                projectMember.setCreatedAt(LocalDateTime.now());
                projectMember.setUpdatedAt(LocalDateTime.now());

                ProjectMember savedMember = projectMemberRepository.save(projectMember);

                // Record activity
                activityService.recordActivity(
                                projectId,
                                null,
                                requestUserId,
                                "ADD_MEMBER",
                                "Added user " + user.getUsername() + " to project");

                return mapToDTO(savedMember);
        }

        @Override
        public List<ProjectMemberDTO> getProjectMembers(Long projectId, Long requestUserId) {
                // Check if requester has access to project
                if (!projectService.isUserProjectMember(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to view project members");
                }

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

                List<ProjectMember> members = projectMemberRepository.findByProjectAndIsDeleteFalse(project);
                return members.stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public ProjectMemberDTO updateProjectMember(Long projectId, Long userId, Long roleId, Boolean isAdmin,
                        Long requestUserId) {
                // Check if requester is admin
                if (!projectService.isUserProjectAdmin(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to update project members");
                }

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                ProjectMember projectMember = projectMemberRepository.findByProjectAndUser(project, user)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "User is not a member of this project"));

                if (roleId != null) {
                        ProjectRole projectRole = projectRoleRepository.findById(roleId)
                                        .orElseThrow(() -> new IllegalArgumentException("Project role not found"));

                        // Check if role belongs to the project
                        if (!projectRole.getProject().getId().equals(projectId)) {
                                throw new IllegalArgumentException("Role does not belong to this project");
                        }

                        projectMember.setProjectRole(projectRole);
                }

                if (isAdmin != null) {
                        projectMember.setIsAdmin(isAdmin);
                }

                projectMember.setUpdatedAt(LocalDateTime.now());
                ProjectMember updatedMember = projectMemberRepository.save(projectMember);

                // Record activity
                activityService.recordActivity(
                                projectId,
                                null,
                                requestUserId,
                                "UPDATE_MEMBER",
                                "Updated role for user " + user.getUsername());

                return mapToDTO(updatedMember);
        }

        @Override
        @Transactional
        public void removeProjectMember(Long projectId, Long userId, Long requestUserId) {
                // Check if requester is admin
                if (!projectService.isUserProjectAdmin(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to remove project members");
                }

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                // Don't allow removing the project owner
                if (project.getOwner().getId().equals(user.getId())) {
                        throw new IllegalArgumentException("Cannot remove the project owner");
                }

                ProjectMember projectMember = projectMemberRepository.findByProjectAndUser(project, user)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "User is not a member of this project"));

                projectMember.setIsDelete(true);
                projectMember.setUpdatedAt(LocalDateTime.now());
                projectMemberRepository.save(projectMember);

                // Record activity
                activityService.recordActivity(
                                projectId,
                                null,
                                requestUserId,
                                "REMOVE_MEMBER",
                                "Removed user " + user.getUsername() + " from project");
        }

        @Override
        public List<ProjectMemberDTO> getUserProjects(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                List<ProjectMember> memberships = projectMemberRepository.findByUser(user);
                return memberships.stream()
                                .filter(m -> !m.getIsDelete())
                                .filter(m -> m.getProject() != null && !m.getProject().getIsDeleted())
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());
        }

        @Override
        public ProjectMemberDTO getProjectMember(Long projectId, Long userId) {
                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                ProjectMember projectMember = projectMemberRepository.findByProjectAndUser(project, user)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "User is not a member of this project"));

                return mapToDTO(projectMember);
        }

        @Override
        @Transactional
        public void updateMemberPoints(Long projectId, Long userId, Integer points, Long requestUserId) {
                // Check if requester is admin
                if (!projectService.isUserProjectAdmin(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to update member points");
                }

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                ProjectMember projectMember = projectMemberRepository.findByProjectAndUser(project, user)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "User is not a member of this project"));

                projectMember.setTotalPoint(projectMember.getTotalPoint() + points);
                projectMember.setUpdatedAt(LocalDateTime.now());
                projectMemberRepository.save(projectMember);

                // Record activity
                activityService.recordActivity(
                                projectId,
                                null,
                                requestUserId,
                                "UPDATE_POINTS",
                                "Updated points for user " + user.getUsername() + " by " + points);
        }

        private ProjectMemberDTO mapToDTO(ProjectMember member) {
                ProjectMemberDTO dto = new ProjectMemberDTO();
                dto.setId(member.getId());
                dto.setProjectId(member.getProject() != null ? member.getProject().getId() : null);
                dto.setUserId(member.getUser() != null ? Long.valueOf(member.getUser().getId()) : null);
                dto.setUsername(member.getUser() != null ? member.getUser().getUsername() : null);
                dto.setUserFullName(member.getUser() != null ? member.getUser().getFullName() : null);
                dto.setProjectRoleId(member.getProjectRole() != null ? member.getProjectRole().getId() : null);
                dto.setRoleName(member.getProjectRole() != null ? member.getProjectRole().getRoleName() : null);
                dto.setTotalPoint(member.getTotalPoint());
                dto.setIsAdmin(member.getIsAdmin());
                dto.setJoinedAt(member.getCreatedAt());
                return dto;
        }
}