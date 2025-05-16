package edu.ptit.ttcs.service;

import java.util.List;

import edu.ptit.ttcs.entity.dto.ProjectInviteDTO;
import edu.ptit.ttcs.entity.dto.ProjectMemberDTO;

public interface ProjectMemberService {

    ProjectMemberDTO addMemberToProject(Long projectId, Long userId, Long roleId, Boolean isAdmin, Long requestUserId);

    List<ProjectMemberDTO> getProjectMembers(Long projectId, Long requestUserId);

    ProjectMemberDTO updateProjectMember(Long projectId, Long userId, Long roleId, Boolean isAdmin, Long requestUserId);

    void removeProjectMember(Long projectId, Long userId, Long requestUserId);

    List<ProjectMemberDTO> getUserProjects(Long userId);

    ProjectMemberDTO getProjectMember(Long projectId, Long userId);

    void updateMemberPoints(Long projectId, Long userId, Integer points, Long requestUserId);

    void inviteUserByEmail(Long projectId, ProjectInviteDTO invite, Long requestUserId);

    List<ProjectMemberDTO> getProjectMembersList(Long projectId);

    /**
     * Accept a project invitation from notification
     * 
     * @param notificationId ID of the notification containing the invitation
     * @param userId         ID of the user accepting the invitation
     * @return The created project member
     */
    ProjectMemberDTO acceptProjectInvitation(Integer notificationId, Long userId);

    /**
     * Reject a project invitation from notification
     * 
     * @param notificationId ID of the notification containing the invitation
     * @param userId         ID of the user rejecting the invitation
     */
    void rejectProjectInvitation(Integer notificationId, Long userId);

    /**
     * User leaves a project
     * 
     * @param projectId ID of the project to leave
     * @param userId    ID of the user leaving the project
     */
    void leaveProject(Long projectId, Long userId);
}