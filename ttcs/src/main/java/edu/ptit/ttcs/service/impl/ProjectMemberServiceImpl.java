package edu.ptit.ttcs.service.impl;

import edu.ptit.ttcs.dao.NotificationRepository;
import edu.ptit.ttcs.dao.ProjectMemberRepository;
import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.dao.ProjectRoleRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.entity.Notification;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.ProjectInviteDTO;
import edu.ptit.ttcs.entity.dto.ProjectMemberDTO;
import edu.ptit.ttcs.service.ActivityService;
import edu.ptit.ttcs.service.ProjectMemberService;
import edu.ptit.ttcs.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectMemberServiceImpl implements ProjectMemberService {

        private final ProjectRepository projectRepository;
        private final UserRepository userRepository;
        private final ProjectMemberRepository projectMemberRepository;
        private final ProjectRoleRepository projectRoleRepository;
        private final ProjectService projectService;
        private final ActivityService activityService;
        private final NotificationRepository notificationRepository;

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

                List<ProjectMember> memberships = projectMemberRepository.findByUserAndIsDeleteIsFalse(user);
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

        @Override
        @Transactional
        public void inviteUserByEmail(Long projectId, ProjectInviteDTO invite, Long requestUserId) {
                // Check if requester is admin
                if (!projectService.isUserProjectAdmin(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to invite members to this project");
                }

                // Validate invite parameters
                invite.validate();

                // Get project
                Project project = projectRepository.findById(projectId)
                        .orElseThrow(() -> new IllegalArgumentException("Project not found"));

                // Get role if provided
                ProjectRole projectRole = null;
                if (invite.getRoleId() != null) {
                        projectRole = projectRoleRepository.findById(invite.getRoleId())
                                .orElseThrow(() -> new IllegalArgumentException("Project role not found"));

                        // Check if role belongs to the project
                        if (!projectRole.getProject().getId().equals(projectId)) {
                                throw new IllegalArgumentException("Role does not belong to this project");
                        }
                }

                // Get user by email
                User user = userRepository.findByEmail(invite.getEmail());
                
                // If user doesn't exist, just create the notification without a receiver (will be handled later when user registers)
                if (user == null) {
                        // Create notification for future processing
                        createInviteNotification(null, project, projectRole, invite.getIsAdmin(), requestUserId);
                        
                        // Record activity
                        activityService.recordActivity(
                                projectId,
                                null,
                                requestUserId,
                                "INVITE_SENT",
                                "Sent invitation to " + invite.getEmail());
                        
                        return;
                }
                
                // Check if user is already a member
                if (projectMemberRepository.existsByProjectAndUserAndIsDeleteFalse(project, user)) {
                        throw new IllegalArgumentException("User is already a member of this project");
                }
                
                // Create notification for existing user
                createInviteNotification(user, project, projectRole, invite.getIsAdmin(), requestUserId);
                
                // Record activity
                activityService.recordActivity(
                        projectId,
                        null,
                        requestUserId,
                        "INVITE_SENT",
                        "Sent invitation to " + user.getUsername());
        }
        
        private void createInviteNotification(User receiver, Project project, ProjectRole role, Boolean isAdmin, Long senderId) {
                Notification notification = new Notification();
                notification.setReceiver(receiver);
                notification.setDescription("You have been invited to join project: " + project.getName());
                notification.setObjectId(project.getId().intValue());
                notification.setType("PROJECT_INVITE");
                notification.setCreatedAt(LocalDateTime.now());
                notification.setUpdatedAt(LocalDateTime.now());

                User sender = userRepository.findById(senderId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                notification.setCreatedBy(sender);
                notification.setCreatedBy(sender);
                notification.setIsSeen(false);
                
                // Store role and isAdmin info in the description to be used when accepting the invite
                if (role != null) {
                        notification.setDescription(notification.getDescription() + 
                                " with role: " + role.getRoleName() + " (ID: " + role.getId() + ")");
                }
                
                if (isAdmin != null && isAdmin) {
                        notification.setDescription(notification.getDescription() + " as an admin");
                }
                
                notificationRepository.save(notification);
        }

        @Override
        @Transactional
        public ProjectMemberDTO acceptProjectInvitation(Integer notificationId, Long userId) {
                // Find the notification
                Notification notification = notificationRepository.findById(notificationId)
                        .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
                
                // Validate that the notification is for the right user
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
                if (notification.getReceiver() == null || !notification.getReceiver().getId().equals(user.getId())) {
                        throw new IllegalArgumentException("This invitation is not for you");
                }
                
                // Validate that it's a project invitation
                if (!"PROJECT_INVITE".equals(notification.getType())) {
                        throw new IllegalArgumentException("This notification is not a project invitation");
                }
                
                // Extract project ID from the notification
                Long projectId = notification.getObjectId().longValue();
                Project project = projectRepository.findById(projectId)
                        .orElseThrow(() -> new IllegalArgumentException("Project not found"));
                
                // Check if user is already a member
                if (projectMemberRepository.existsByProjectAndUserAndIsDeleteFalse(project, user)) {
                        // Instead of throwing exception, mark notification as seen and create a notification
                        notification.setIsSeen(true);
                        notificationRepository.save(notification);
                        
                        // Create a notification to inform the user
                        Notification alreadyMemberNotification = new Notification();
                        alreadyMemberNotification.setReceiver(user);
                        alreadyMemberNotification.setDescription("You are already a member of project: " + project.getName());
                        alreadyMemberNotification.setObjectId(project.getId().intValue());
                        alreadyMemberNotification.setType("INFO");
                        alreadyMemberNotification.setCreatedAt(LocalDateTime.now());
                        alreadyMemberNotification.setIsSeen(false);
                        notificationRepository.save(alreadyMemberNotification);
                        
                        // Create notification for the invitation sender
                        if (notification.getCreatedBy() != null) {
                            Notification senderNotification = new Notification();
                            senderNotification.setReceiver(notification.getCreatedBy());
                            senderNotification.setDescription(user.getUsername() + " is already a member of project: " + project.getName());
                            senderNotification.setObjectId(project.getId().intValue());
                            senderNotification.setType("INFO");
                            senderNotification.setCreatedAt(LocalDateTime.now());
                            senderNotification.setIsSeen(false);
                            notificationRepository.save(senderNotification);
                        }
                        
                        throw new IllegalArgumentException("You are already a member of this project");
                }
                
                // Extract role and isAdmin from the description (if available)
                Long roleId = null;
                Boolean isAdmin = false;
                
                String description = notification.getDescription();
                if (description.contains("(ID: ")) {
                        int startIndex = description.indexOf("(ID: ") + 5;
                        int endIndex = description.indexOf(")", startIndex);
                        if (endIndex > startIndex) {
                                try {
                                        roleId = Long.parseLong(description.substring(startIndex, endIndex));
                                } catch (NumberFormatException e) {
                                        // Ignore parsing errors, roleId will remain null
                                }
                        }
                }
                
                if (description.contains("as an admin")) {
                        isAdmin = true;
                }
                
                // Get project role if provided
                ProjectRole projectRole = null;
                if (roleId != null) {
                        projectRole = projectRoleRepository.findById(roleId)
                                .orElse(null); // Don't throw if role not found, just leave it null
                }
                
                // Create new ProjectMember
                ProjectMember projectMember = new ProjectMember();
                projectMember.setProject(project);
                projectMember.setUser(user);
                projectMember.setProjectRole(projectRole);
                projectMember.setTotalPoint(0);
                projectMember.setIsAdmin(isAdmin);
                projectMember.setIsDelete(false);
                projectMember.setCreatedAt(LocalDateTime.now());
                projectMember.setUpdatedAt(LocalDateTime.now());
                
                ProjectMember savedMember = projectMemberRepository.save(projectMember);
                
                // Mark notification as seen
                notification.setIsSeen(true);
                notificationRepository.save(notification);
                
                // Create notification for the invitation sender
                if (notification.getCreatedBy() != null) {
                        createAcceptanceNotification(notification.getCreatedBy().getId(), user, project);
                }
                
                // Record activity
                activityService.recordActivity(
                        projectId,
                        null,
                        userId,
                        "ACCEPT_INVITATION",
                        "Accepted invitation to join project");
                
                return mapToDTO(savedMember);
        }
        
        @Override
        @Transactional
        public void rejectProjectInvitation(Integer notificationId, Long userId) {
                // Find the notification
                Notification notification = notificationRepository.findById(notificationId)
                        .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
                
                // Validate that the notification is for the right user
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
                if (notification.getReceiver() == null || !notification.getReceiver().getId().equals(user.getId())) {
                        throw new IllegalArgumentException("This invitation is not for you");
                }
                
                // Validate that it's a project invitation
                if (!"PROJECT_INVITE".equals(notification.getType())) {
                        throw new IllegalArgumentException("This notification is not a project invitation");
                }
                
                // Extract project ID from the notification
                Long projectId = notification.getObjectId().longValue();
                Project project = projectRepository.findById(projectId)
                        .orElseThrow(() -> new IllegalArgumentException("Project not found"));
                
                // Mark notification as seen
                notification.setIsSeen(true);
                notificationRepository.save(notification);
                
                // Create notification for the invitation sender
                if (notification.getCreatedBy() != null) {
                        createRejectionNotification(notification.getCreatedBy().getId(), user, project);
                }
                
                // Record activity
                activityService.recordActivity(
                        projectId,
                        null,
                        userId,
                        "REJECT_INVITATION",
                        "Rejected invitation to join project");
        }
        
        private void createAcceptanceNotification(Long receiverId, User acceptingUser, Project project) {
                User receiver = userRepository.findById(receiverId)
                        .orElse(null);
                
                if (receiver == null) {
                        return; // If receiver not found, don't create notification
                }
                
                Notification notification = new Notification();
                notification.setReceiver(receiver);
                notification.setDescription(acceptingUser.getUsername() + " has accepted your invitation to join project: " + project.getName());
                notification.setObjectId(project.getId().intValue());
                notification.setType("INVITATION_ACCEPTED");
                notification.setCreatedBy(acceptingUser);
                notification.setIsSeen(false);
                
                notificationRepository.save(notification);
        }
        
        private void createRejectionNotification(Long receiverId, User rejectingUser, Project project) {
                User receiver = userRepository.findById(receiverId)
                        .orElse(null);
                
                if (receiver == null) {
                        return; // If receiver not found, don't create notification
                }
                
                Notification notification = new Notification();
                notification.setReceiver(receiver);
                notification.setDescription(rejectingUser.getUsername() + " has declined your invitation to join project: " + project.getName());
                notification.setObjectId(project.getId().intValue());
                notification.setType("INVITATION_REJECTED");
                notification.setCreatedBy(rejectingUser);
                notification.setIsSeen(false);
                
                notificationRepository.save(notification);
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
                dto.setAvatar(member.getUser().getAvatar());
                return dto;
        }

        @Override
        @Transactional
        public void leaveProject(Long projectId, Long userId) {
                Project project = projectRepository.findById(projectId)
                        .orElseThrow(() -> new IllegalArgumentException("Project not found"));

                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));

                // Don't allow the project owner to leave the project
                if (project.getOwner() != null && project.getOwner().getId().equals(userId)) {
                        throw new IllegalArgumentException("Project owners cannot leave their projects. You must transfer ownership or delete the project.");
                }

                // Find the membership
                ProjectMember projectMember = projectMemberRepository.findLastByProjectAndUser(project.getId(), user.getId())
                        .orElseThrow(() -> new IllegalArgumentException("You are not a member of this project"));

                // Mark the membership as deleted
                projectMember.setIsDelete(true);
                projectMember.setUpdatedAt(LocalDateTime.now());
                projectMemberRepository.save(projectMember);

                // Record the activity
                activityService.recordActivity(
                        projectId,
                        null,
                        userId,
                        "LEAVE_PROJECT",
                        user.getUsername() + " left the project");
                
                // Notify project admins
                notifyAdminsAboutUserLeaving(project, user);
        }
        
        private void notifyAdminsAboutUserLeaving(Project project, User leavingUser) {
                // Find all admin members of the project
                List<ProjectMember> adminMembers = projectMemberRepository.findByProjectAndIsAdminTrueAndIsDeleteFalse(project);
                
                if (adminMembers.isEmpty()) {
                        return;
                }
                
                // Create notifications for each admin
                for (ProjectMember admin : adminMembers) {
                        // Skip creating notification for the leaving user if they were an admin
                        if (admin.getUser().getId().equals(leavingUser.getId())) {
                                continue;
                        }
                        
                        Notification notification = new Notification();
                        notification.setReceiver(admin.getUser());
                        notification.setDescription(leavingUser.getUsername() + " has left project: " + project.getName());
                        notification.setObjectId(project.getId().intValue());
                        notification.setType("MEMBER_LEFT");
                        notification.setCreatedBy(leavingUser);
                        notification.setIsSeen(false);
                        notification.setCreatedAt(LocalDateTime.now());
                        
                        notificationRepository.save(notification);
                }
        }
}