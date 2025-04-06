package edu.ptit.ttcs.service.impl;

import edu.ptit.ttcs.dao.ProjectMemberRepository;
import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.dto.ProjectCreateDTO;
import edu.ptit.ttcs.dto.ProjectDTO;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.service.ActivityService;
import edu.ptit.ttcs.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    
    @Autowired
    private ActivityService activityService;

    @Override
    @Transactional
    public ProjectDTO createProject(ProjectCreateDTO projectDTO, Long ownerId) {
        User owner = userRepository.findById(ownerId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Project project = new Project();
        project.setName(projectDTO.getName());
        project.setDescription(projectDTO.getDescription());
        project.setOwner(owner);
        project.setIsPublic(projectDTO.getIsPublic() != null ? projectDTO.getIsPublic() : false);
        project.setLogoUrl(projectDTO.getLogoUrl());
        project.setIsDeleted(false);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        
        Project savedProject = projectRepository.save(project);
        
        // Add owner as admin member
        ProjectMember ownerMember = new ProjectMember();
        ownerMember.setProject(savedProject);
        ownerMember.setUser(owner);
        ownerMember.setIsAdmin(true);
        ownerMember.setTotalPoint(0);
        ownerMember.setIsDelete(false);
        ownerMember.setCreatedAt(LocalDateTime.now());
        ownerMember.setUpdatedAt(LocalDateTime.now());
        projectMemberRepository.save(ownerMember);
        
        // Record activity
        activityService.recordActivity(
            savedProject.getId(), 
            null, 
            ownerId, 
            "CREATE_PROJECT", 
            "Created project: " + savedProject.getName()
        );
        
        return mapToDTO(savedProject);
    }

    @Override
    public ProjectDTO getProjectById(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        // Check if project is public or user is a member
        if (!project.getIsPublic() && !isUserProjectMember(projectId, userId)) {
            throw new IllegalArgumentException("You don't have permission to view this project");
        }
        
        return mapToDTO(project);
    }

    @Override
    public List<ProjectDTO> getProjectsByUser(Long userId) {
        User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        List<Project> projects = projectRepository.findByOwner(user);
        return projects.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectDTO> getAllActiveProjects() {
        List<Project> projects = projectRepository.findByIsDeletedFalse();
        return projects.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectDTO> getAllPublicProjects() {
        List<Project> projects = projectRepository.findByIsPublicTrueAndIsDeletedFalse();
        return projects.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectDTO updateProject(Long projectId, ProjectCreateDTO projectDTO, Long userId) {
        Project project = projectRepository.findById(projectId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        // Check if user is admin
        if (!isUserProjectAdmin(projectId, userId)) {
            throw new IllegalArgumentException("You don't have permission to update this project");
        }
        
        project.setName(projectDTO.getName());
        project.setDescription(projectDTO.getDescription());
        project.setIsPublic(projectDTO.getIsPublic());
        project.setLogoUrl(projectDTO.getLogoUrl());
        project.setUpdatedAt(LocalDateTime.now());
        
        Project updatedProject = projectRepository.save(project);
        
        // Record activity
        activityService.recordActivity(
            projectId, 
            null, 
            userId, 
            "UPDATE_PROJECT", 
            "Updated project: " + updatedProject.getName()
        );
        
        return mapToDTO(updatedProject);
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        // Check if user is admin
        if (!isUserProjectAdmin(projectId, userId)) {
            throw new IllegalArgumentException("You don't have permission to delete this project");
        }
        
        project.setIsDeleted(true);
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);
        
        // Record activity
        activityService.recordActivity(
            projectId, 
            null, 
            userId, 
            "DELETE_PROJECT", 
            "Deleted project: " + project.getName()
        );
    }

    @Override
    @Transactional
    public void restoreProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        // Check if user is owner
        if (!project.getOwner().getId().equals(userId.intValue())) {
            throw new IllegalArgumentException("Only the project owner can restore this project");
        }
        
        project.setIsDeleted(false);
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);
        
        // Record activity
        activityService.recordActivity(
            projectId, 
            null, 
            userId, 
            "RESTORE_PROJECT", 
            "Restored project: " + project.getName()
        );
    }

    @Override
    public boolean isUserProjectMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return projectMemberRepository.existsByProjectAndUserAndIsDeleteFalse(project, user);
    }

    @Override
    public boolean isUserProjectAdmin(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return projectMemberRepository.findByProjectAndUser(project, user)
                .map(ProjectMember::getIsAdmin)
                .orElse(false);
    }
    
    private ProjectDTO mapToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setOwnerId(project.getOwner() != null ? Long.valueOf(project.getOwner().getId()) : null);
        dto.setOwnerName(project.getOwner() != null ? project.getOwner().getUsername() : null);
        dto.setIsPublic(project.getIsPublic());
        dto.setLogoUrl(project.getLogoUrl());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        return dto;
    }
} 