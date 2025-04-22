package edu.ptit.ttcs.service;

import java.util.List;

import edu.ptit.ttcs.entity.dto.ProjectMemberDTO;

public interface ProjectMemberService {

    ProjectMemberDTO addMemberToProject(Long projectId, Long userId, Long roleId, Boolean isAdmin, Long requestUserId);

    List<ProjectMemberDTO> getProjectMembers(Long projectId, Long requestUserId);

    ProjectMemberDTO updateProjectMember(Long projectId, Long userId, Long roleId, Boolean isAdmin, Long requestUserId);

    void removeProjectMember(Long projectId, Long userId, Long requestUserId);

    List<ProjectMemberDTO> getUserProjects(Long userId);

    ProjectMemberDTO getProjectMember(Long projectId, Long userId);

    void updateMemberPoints(Long projectId, Long userId, Integer points, Long requestUserId);

    List<ProjectMemberDTO> getProjectMembersList(Long projectId);
}