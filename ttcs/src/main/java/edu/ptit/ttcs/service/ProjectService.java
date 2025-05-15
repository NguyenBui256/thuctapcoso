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
    public Project createProject(CreateProjectDTO createProjectDTO) {
        User creator = userRepository.findById(createProjectDTO.getOwnerId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectMapper.toEntity(createProjectDTO);
        // Không set createdBy lúc này
        project.setCreatedBy(null);
        project.setIsDeleted(false);
        log.info("Project CREATED AT: {}", project.getCreatedAt());
        project = projectRepository.save(project);
        log.info("Project created: {}", project.getId());

        ProjectRole toSetForAdminProjectRole = null;
        ProjectMember projectMember = null;
        List<ProjectRole> projectRoleList = new ArrayList<>();

        // Create first project member for creator
        ProjectMember creatorMember = new ProjectMember();
        creatorMember.setProject(project);
        creatorMember.setUser(creator);
        creatorMember.setIsAdmin(true);
        creatorMember.setCreatedAt(LocalDateTime.now());
        creatorMember.setUpdatedAt(LocalDateTime.now());
        creatorMember = projectMemberRepository.save(creatorMember);

        // Sau khi đã tạo xong ProjectMember, cập nhật lại createdBy cho Project
        project.setCreatedBy(creator);
        project = projectRepository.save(project);
        log.info("Updated project with creator ID: {}", creator.getId());

        for (ProjectRoleName roleName : ProjectRoleName.values()) {
            ProjectRole projectRole = new ProjectRole();
            projectRole.setProject(project);
            projectRole.setRoleName(roleName.name());
            projectRole.setCreatedBy(creatorMember);
            projectRole.setUpdatedBy(creatorMember);
            projectRole.setCreatedAt(LocalDateTime.now());
            projectRole.setUpdatedAt(LocalDateTime.now());

            // Initialize default permissions based on role
            initializeRolePermissions(projectRole);

            projectRole = projectRoleRepository.save(projectRole);
            if (roleName == ProjectRoleName.PROJECT_MANAGER) {
                toSetForAdminProjectRole = projectRole;
            }
            log.info("ProjectRole {} - ID: {}", projectRole.getRoleName(), projectRole.getId());
        }

        // Update the created project member with role
        creatorMember.setProjectRole(toSetForAdminProjectRole);
        creatorMember.setCreatedBy(creatorMember);
        creatorMember.setUpdatedBy(creatorMember);
        projectMemberRepository.save(creatorMember);
        log.info("ProjectMember ID: {}", creatorMember.getId());

        return project;
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

                // Initialize default permissions based on role
                initializeRolePermissions(projectRole);

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

        // Handle null owner in source project
        if (sourceProject.getOwner() == null) {
            log.warn("Source project {} has null owner, using createdBy as owner", sourceProject.getId());
            if (sourceProject.getCreatedBy() != null) {
                sourceProject.setOwner(sourceProject.getCreatedBy());
                sourceProject = projectRepository.save(sourceProject);
            }
        }

        User currentUser = securityUtils.getCurrentUser();

        User creator = userRepository.findById(projectDTO.getOwnerId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if the project member exists
        ProjectMember projectMember = null;
        try {
            projectMember = projectMemberRepository.findByProjectAndUser(sourceProject, creator)
                    .orElse(null);
        } catch (Exception e) {
            log.warn("Error finding project member: {}", e.getMessage());
        }

        // If project member not found, create a temporary one for reference only
        if (projectMember == null) {
            log.info(
                    "Project Member not found for user {} in project {}. Creating new project without member reference.",
                    creator.getId(), sourceProject.getId());
        }

        Project newProject = new Project();
        newProject.setName(projectDTO.getName());
        newProject.setDescription(projectDTO.getDescription());
        newProject.setIsPublic(projectDTO.getIsPublic());
        newProject.setLogoUrl(sourceProject.getLogoUrl());
        // Set owner explicitly
        newProject.setOwner(creator);
        // Không set createdBy lúc này
        newProject.setCreatedBy(null);
        // Do not set modules here, as we'll initialize them properly below
        // newProject.setModules(new HashSet<>(sourceProject.getModules()));
        newProject.setCreatedAt(LocalDateTime.now());
        newProject.setUpdatedAt(LocalDateTime.now());
        newProject.setIsDeleted(false);

        // Save without createdBy first
        newProject = projectRepository.save(newProject);

        // Initialize default modules for the new project
        try {
            moduleService.initializeProjectModules(newProject.getId());
            log.info("Successfully initialized default modules for duplicated project ID: {}", newProject.getId());
        } catch (Exception e) {
            log.error("Error initializing modules for duplicated project ID: {} - Error: {}", newProject.getId(),
                    e.getMessage());
            // Continue with project duplication even if module initialization fails
        }

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
        try {
            log.info("Checking if user {} is an admin for project {}", userId, projectId);
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Check if user is the project creator
            if (project.getCreatedBy() != null && project.getCreatedBy().getId().equals(userId)) {
                log.info("User {} is the creator of project {}, admin access granted", userId, projectId);
                return true;
            }

            // Check if user has PROJECT_MANAGER role
            ProjectMember member = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(projectId, userId);
            if (member != null && member.getProjectRole() != null &&
                    ProjectRoleName.PROJECT_MANAGER.name().equals(member.getProjectRole().getRoleName())) {
                log.info("User {} has PROJECT_MANAGER role in project {}, admin access granted", userId, projectId);
                return true;
            }

            // Check if user is marked as admin in project_member table
            if (member != null && Boolean.TRUE.equals(member.getIsAdmin())) {
                log.info("User {} is marked as admin in project {}, admin access granted", userId, projectId);
                return true;
            }

            log.info("User {} is NOT an admin for project {}", userId, projectId);
            return false;
        } catch (Exception e) {
            log.error("Error checking if user {} is admin for project {}: {}", userId, projectId, e.getMessage(), e);
            return false;
        }
    }

    public boolean isUserProjectMember(Long projectId, Long userId) {
        try {
            log.info("Checking if user {} is a member of project {}", userId, projectId);
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            log.info("Found project {}: {} and user {}: {}", projectId, project.getName(), userId, user.getUsername());

            // Check project owner first - owners are always considered members
            if (project.getCreatedBy() != null && project.getCreatedBy().getId().equals(userId)) {
                log.info("User {} is the owner of project {}, access granted", userId, projectId);
                return true;
            }

            // Check project membership
            boolean isMember = projectMemberRepository.existsByProjectIdAndUserIdAndIsDeleteFalse(project.getId(),
                    user.getId());
            log.info("Membership check for user {} in project {}: {}", userId, projectId,
                    isMember ? "IS member" : "NOT a member");

            return isMember;
        } catch (Exception e) {
            log.error("Error checking project membership: {}", e.getMessage(), e);
            return false;
        }
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
                    prp = projectRolePermissionRepository.save(prp);
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
        try {
            List<Project> projects = projectRepository.findByUserAssigned(userId);

            // Handle null owners in all projects
            projects.forEach(this::handleNullOwner);

            return projectMapper.toDTOList(projects);
        } catch (Exception e) {
            log.error("Error finding assigned projects for user ID {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Error finding assigned projects: " + e.getMessage());
        }
    }

    /**
     * Find projects where user is watching tasks
     *
     * @param userId The ID of the user
     * @return List of projects
     */
    public List<ProjectDTO> findWatchedProjects(Long userId) {
        try {
            List<Project> projects = projectRepository.findByUserWatching(userId);

            // Handle null owners in all projects
            projects.forEach(this::handleNullOwner);

            return projectMapper.toDTOList(projects);
        } catch (Exception e) {
            log.error("Error finding watched projects for user ID {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Error finding watched projects: " + e.getMessage());
        }
    }

    /**
     * Find projects where user is a member
     *
     * @param userId The ID of the user
     * @return List of projects
     */
    public List<ProjectDTO> findJoinedProjects(Long userId) {
        try {
            List<Project> projects = projectRepository.findByUserJoined(userId);

            // Handle null owners in all projects
            projects.forEach(this::handleNullOwner);

            return projectMapper.toDTOList(projects);
        } catch (Exception e) {
            log.error("Error finding joined projects for user ID {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Error finding joined projects: " + e.getMessage());
        }
    }

    // Add this helper method to handle null owners
    private void handleNullOwner(Project project) {
        try {
            if (project.getOwner() == null) {
                log.warn("Project {} has null owner, using createdBy as owner", project.getId());
                if (project.getCreatedBy() != null) {
                    project.setOwner(project.getCreatedBy());
                    projectRepository.save(project);
                } else {
                    // If both owner and createdBy are null, try to find a project admin or any
                    // member
                    List<ProjectMember> members = projectMemberRepository.findAllByProjectAndIsDeleteIsFalse(project);
                    if (!members.isEmpty()) {
                        // First try to find an admin
                        ProjectMember adminMember = members.stream()
                                .filter(ProjectMember::getIsAdmin)
                                .findFirst()
                                .orElse(members.get(0)); // Fallback to first member

                        project.setOwner(adminMember.getUser());
                        log.warn("Project {} had null owner and null createdBy, using member {} as owner",
                                project.getId(), adminMember.getUser().getUsername());
                        projectRepository.save(project);
                    } else {
                        log.error("Project {} has null owner and no members to use as owner", project.getId());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error handling null owner for project {}: {}", project.getId(), e.getMessage(), e);
        }
    }
}