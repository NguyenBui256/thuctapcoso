package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.*;
import edu.ptit.ttcs.dao.ModuleRepository;
import edu.ptit.ttcs.dao.ProjectModuleRepository;
import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.entity.*;
import edu.ptit.ttcs.entity.Module;
import edu.ptit.ttcs.entity.dto.CreateProjectDTO;
import edu.ptit.ttcs.entity.dto.PageResponse;
import edu.ptit.ttcs.entity.dto.ProjectDTO;
import edu.ptit.ttcs.entity.dto.response.PjStatusDTO;
import edu.ptit.ttcs.entity.enums.ProjectRoleName;
import edu.ptit.ttcs.entity.enums.StatusType;
import edu.ptit.ttcs.exception.RequestException;
import edu.ptit.ttcs.mapper.ProjectMapper;
import edu.ptit.ttcs.util.ModelMapper;
import edu.ptit.ttcs.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectModuleRepository projectModuleRepository;
    private final ModuleRepository moduleRepository;
    private final ProjectMapper projectMapper;
    private final SecurityUtils securityUtils;
    private final UserRepository userRepository;
    private final ProjectRoleRepository projectRoleRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final PjSettingStatusRepository pjSettingStatusRepository;
    private final ModuleService moduleService;
    private final PermissionRepository permissionRepository;
    private final PermissionService permissionService;
    private final ProjectRolePermissionRepository projectRolePermissionRepository;

    @Transactional
    public Project save(Project project) {
        return projectRepository.save(project);
    }

    @Transactional
    public Project addModuleToProject(Long projectId, Long moduleId) {
        Project project = findById(projectId);
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));

        Set<Module> modules = project.getModules();
        modules.add(module);
        project.setModules(modules);

        return projectRepository.save(project);
    }

    public PageResponse<ProjectDTO> findAll(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Project> projectPage = projectRepository.findByIsDeletedFalse(pageRequest);

        return new PageResponse<ProjectDTO>(
                projectMapper.toDTOList(projectPage.getContent()),
                projectPage.getNumber(),
                projectPage.getSize(),
                projectPage.getTotalElements(),
                projectPage.getTotalPages(),
                projectPage.isLast(),
                projectPage.isFirst());
    }

    public Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public List<Project> findByOwner(User user) {
        List<ProjectMember> projectMembers = projectMemberRepository.findByUserAndIsDeleteIsFalse(user);
        Set<Project> projects = new HashSet<>();
        for (ProjectMember projectMember : projectMembers) {
            projects.add(projectMember.getProject());
        }
        return projects.stream().toList();
    }

    @Transactional
    public void deleteById(Long id) {
        Project project = findById(id);
        project.setIsDeleted(true);
        projectRepository.save(project);
    }

    public PageResponse<ProjectDTO> findPublicProjects(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Project> projectPage = projectRepository.findByIsPublicTrueAndIsDeletedFalse(pageRequest);

        return new PageResponse<ProjectDTO>(
                projectMapper.toDTOList(projectPage.getContent()),
                projectPage.getNumber(),
                projectPage.getSize(),
                projectPage.getTotalElements(),
                projectPage.getTotalPages(),
                projectPage.isLast(),
                projectPage.isFirst());
    }

    @Transactional
    public Project createProject(CreateProjectDTO createProjectDTO, Long currentUserId) {
        try {
            User currentUser = securityUtils.getCurrentUser();
            log.info("Creating project for user ID: {}", currentUserId);

            Project project = new Project();
            project.setName(createProjectDTO.getName());
            project.setDescription(createProjectDTO.getDescription());
            project.setIsPublic(createProjectDTO.getIsPublic());
            project.setLogoUrl(createProjectDTO.getLogoUrl());
            project.setCreatedBy(currentUser);
            project.setCreatedAt(LocalDateTime.now());
            project.setUpdatedBy(currentUser);
            project.setUpdatedAt(LocalDateTime.now());
            project.setIsDeleted(false);
            project.setOwner(currentUser);

            project = projectRepository.save(project);
            log.info("Project created with ID: {}", project.getId());

            // Initialize default modules for the new project
            try {
                moduleService.initializeProjectModules(project.getId());
                log.info("Successfully initialized default modules for project ID: {}", project.getId());
            } catch (Exception e) {
                log.error("Error initializing modules for project ID: {} - Error: {}", project.getId(), e.getMessage());
                // Continue with project creation even if module initialization fails
            }

            // Create default project roles and first member
            ProjectRole managerRole = null;

            // Create project member first
            ProjectMember creatorMember = new ProjectMember();
            creatorMember.setProject(project);
            creatorMember.setUser(currentUser);
            creatorMember.setIsAdmin(true);
            creatorMember.setCreatedAt(LocalDateTime.now());
            creatorMember.setUpdatedAt(LocalDateTime.now());
            creatorMember = projectMemberRepository.save(creatorMember);
            log.info("Project member created with ID: {}", creatorMember.getId());

            // Sau khi đã tạo xong ProjectMember, cập nhật lại createdBy cho Project
            project.setCreatedBy(currentUser);
            project = projectRepository.save(project);
            log.info("Updated project with creator ID: {}", currentUser.getId());

            for (ProjectRoleName roleName : ProjectRoleName.values()) {
                ProjectRole projectRole = new ProjectRole();
                projectRole.setProject(project);
                projectRole.setRoleName(roleName.name());
                projectRole.setCreatedBy(creatorMember);
                projectRole.setUpdatedBy(creatorMember);
                projectRole.setCreatedAt(LocalDateTime.now());
                projectRole.setUpdatedAt(LocalDateTime.now());

                projectRole = projectRoleRepository.save(projectRole);
                if (roleName == ProjectRoleName.PROJECT_MANAGER) {
                    managerRole = projectRole;
                }
                // Initialize default permissions based on role
                initializeRolePermissions(projectRole);
            }

            // Update member with role and creator info
            creatorMember.setProjectRole(managerRole);
            creatorMember.setCreatedBy(creatorMember);
            creatorMember.setUpdatedBy(creatorMember);
            projectMemberRepository.save(creatorMember);
            log.info("Successfully set roles and updated project member");

            return project;
        } catch (Exception e) {
            log.error("Error creating project: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public Project duplicateProject(Long projectId, CreateProjectDTO projectDTO) {
        Project sourceProject = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User currentUser = securityUtils.getCurrentUser();

        User creator = userRepository.findById(projectDTO.getOwnerId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProjectMember projectMember = projectMemberRepository.findByProjectAndUser(sourceProject, creator)
                .orElseThrow(() -> new RuntimeException("Project Member not found"));

        Project newProject = new Project();
        newProject.setName(projectDTO.getName());
        newProject.setDescription(projectDTO.getDescription());
        newProject.setIsPublic(projectDTO.getIsPublic());
        newProject.setLogoUrl(sourceProject.getLogoUrl());
        // Không set createdBy lúc này
        newProject.setCreatedBy(null);
        newProject.setModules(new HashSet<>(sourceProject.getModules()));
        newProject.setCreatedAt(LocalDateTime.now());
        newProject.setUpdatedAt(LocalDateTime.now());
        newProject.setIsDeleted(false);

        // Save without createdBy first
        newProject = projectRepository.save(newProject);

        // Create a ProjectMember for the current user
        ProjectMember creatorMember = new ProjectMember();
        creatorMember.setProject(newProject);
        creatorMember.setUser(currentUser);
        creatorMember.setIsAdmin(true);
        creatorMember.setCreatedAt(LocalDateTime.now());
        creatorMember.setUpdatedAt(LocalDateTime.now());
        creatorMember = projectMemberRepository.save(creatorMember);

        // Now set the createdBy and update
        newProject.setCreatedBy(creator);
        return projectRepository.save(newProject);
    }

    public List<ProjectDTO> findProjectsForDuplication() {
        return projectRepository.findByIsDeletedFalse().stream()
                .map(projectMapper::toDTO)
                .toList();
    }

    @Transactional
    public Project updateProject(Long id, CreateProjectDTO updateProjectDTO) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project = projectMapper.updateEntity(project, updateProjectDTO);
        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setIsDeleted(true);
        projectRepository.save(project);
    }

    public boolean isUserProjectAdmin(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (project.getCreatedBy() == null) {
            return false;
        }
        return project.getCreatedBy().getId().equals(userId);
    }

    public boolean isUserProjectMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return projectMemberRepository.existsByProjectIdAndUserIdAndIsDeleteFalse(project.getId(), user.getId());
    }

    public List<PjStatusDTO> getTaskStatuses(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RequestException("Project not found"));
        return pjSettingStatusRepository.findAllByProjectAndType(project, StatusType.TASK)
                .stream().map(st -> ModelMapper.getInstance().map(st, PjStatusDTO.class))
                .toList();
    }

    @Transactional
    public void initializeRolePermissions(ProjectRole role) {
        log.info("Initializing permissions for role: {} - ID: {}", role.getRoleName(), role.getId());
        String roleName = role.getRoleName();

        try {
            // Get all permissions
            List<Permission> allPermissions = permissionService.findAll();
            log.info("Found {} permissions to initialize for role: {}", allPermissions.size(), roleName);
            
            // Important: Save the role first to ensure it has an ID
            if (role.getId() == null) {
                role = projectRoleRepository.save(role);
                log.info("Saved role with new ID: {}", role.getId());
            }

            log.info("Creating new permissions for role {}", role.getId());
            List<ProjectRolePermission> newPermissions = new ArrayList<>();

            // Add all permissions one by one
            for (Permission permission : allPermissions) {
                try {
                    // Check if this permission is already assigned to the role to avoid duplicates
                    if (projectRolePermissionRepository.existsByProjectRoleAndPermission(role, permission)) {
                        log.debug("Permission {}.{} already exists for role {}, skipping", 
                            permission.getModule(), permission.getName(), roleName);
                        continue;
                    }
                    
                    // Create new permission mapping
                    ProjectRolePermission prp = new ProjectRolePermission();
                    prp.setProjectRole(role);
                    prp.setPermission(permission);
                    prp.setIsEnabled(true);
                    
                    // Save the permission mapping
                    prp =  projectRolePermissionRepository.save(prp);
                    log.info("New PRP: {} - {}", prp.getId(), prp.getPermission().getId());
                    newPermissions.add(prp);
                    
                    log.debug("Added permission {}.{} to role {}", 
                        permission.getModule(), permission.getName(), roleName);
                } catch (Exception e) {
                    log.error("Error adding permission {} to role {}: {}", 
                        permission.getId(), role.getId(), e.getMessage());
                }
            }
            
            log.info("Successfully added {} permissions to role {}", newPermissions.size(), role.getId());
        } catch (Exception e) {
            log.error("Error initializing permissions for role {}: {}", roleName, e.getMessage(), e);
        }
    }

    public boolean userHasAccessToProject(Long userId, Long projectId) {
        return isUserProjectMember(projectId, userId);
    }

    /**
     * Find projects where user is assigned to tasks
     *
     * @param userId The ID of the user
     * @return List of projects
     */
    public List<ProjectDTO> findAssignedProjects(Long userId) {
        List<Project> projects = projectRepository.findByUserAssigned(userId);
        return projectMapper.toDTOList(projects);
    }

    /**
     * Find projects where user is watching tasks
     *
     * @param userId The ID of the user
     * @return List of projects
     */
    public List<ProjectDTO> findWatchedProjects(Long userId) {
        List<Project> projects = projectRepository.findByUserWatching(userId);
        return projectMapper.toDTOList(projects);
    }

    /**
     * Find projects where user is a member
     *
     * @param userId The ID of the user
     * @return List of projects
     */
    public List<ProjectDTO> findJoinedProjects(Long userId) {
        List<Project> projects = projectRepository.findByUserJoined(userId);
        return projectMapper.toDTOList(projects);
    }
}