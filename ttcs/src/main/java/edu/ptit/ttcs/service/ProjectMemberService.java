package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dto.ProjectMemberDTO;

import java.util.List;

public interface ProjectMemberService {
    
    ProjectMemberDTO addMemberToProject(Long projectId, Long userId, Long roleId, Boolean isAdmin, Long requestUserId);
    
    List<ProjectMemberDTO> getProjectMembers(Long projectId, Long requestUserId);
    
    ProjectMemberDTO updateProjectMember(Long projectId, Long userId, Long roleId, Boolean isAdmin, Long requestUserId);
    
    void removeProjectMember(Long projectId, Long userId, Long requestUserId);
    
    List<ProjectMemberDTO> getUserProjects(Long userId);
    
    ProjectMemberDTO getProjectMember(Long projectId, Long userId);
    
    void updateMemberPoints(Long projectId, Long userId, Integer points, Long requestUserId);
} 