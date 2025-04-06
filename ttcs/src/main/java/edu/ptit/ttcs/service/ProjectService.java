package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dto.ProjectCreateDTO;
import edu.ptit.ttcs.dto.ProjectDTO;

import java.util.List;

public interface ProjectService {
    
    ProjectDTO createProject(ProjectCreateDTO projectDTO, Long ownerId);
    
    ProjectDTO getProjectById(Long projectId, Long userId);
    
    List<ProjectDTO> getProjectsByUser(Long userId);
    
    List<ProjectDTO> getAllActiveProjects();
    
    List<ProjectDTO> getAllPublicProjects();
    
    ProjectDTO updateProject(Long projectId, ProjectCreateDTO projectDTO, Long userId);
    
    void deleteProject(Long projectId, Long userId);
    
    void restoreProject(Long projectId, Long userId);
    
    boolean isUserProjectMember(Long projectId, Long userId);
    
    boolean isUserProjectAdmin(Long projectId, Long userId);
} 