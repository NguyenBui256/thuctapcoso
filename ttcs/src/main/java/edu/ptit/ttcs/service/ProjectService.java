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
import java.util.stream.Collectors;

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
    public ProjectRole initializeRolePermissions(ProjectRole role) {
        log.info("Initializing permissions for role: {}", role.getRoleName());
        Set<Permission> permissions = new HashSet<>();
        String roleName = role.getRoleName();

        try {
            // Common permissions for all roles - read access to basic modules
            List<Permission> viewPermissions = permissionRepository.findAll().stream()
                    .filter(p -> p.getMethod().equals("GET"))
                    .collect(Collectors.toList());
            permissions.addAll(viewPermissions);

            if (roleName.equals(ProjectRoleName.PROJECT_MANAGER.name())) {
                // Project Manager gets all permissions
                permissions.addAll(permissionRepository.findAll());
            } else if (roleName.equals(ProjectRoleName.FRONTEND_DEVELOPER.name()) ||
                    roleName.equals(ProjectRoleName.BACKEND_DEVELOPER.name())) {
                // Developers get task and User Story related permissions
                permissions.addAll(permissionRepository.findByModule("Tasks"));
                permissions.addAll(permissionRepository.findByModule("User Stories"));

                // Add ability to comment on issues
                permissions.addAll(permissionRepository.findByMethodAndModule("POST", "Issues"));

                // Wiki access
                permissions.addAll(permissionRepository.findByModule("Wiki"));
            } else if (roleName.equals(ProjectRoleName.QA_ENGINEER.name()) ||
                    roleName.equals(ProjectRoleName.TESTER.name())) {
                // QA and Testers get issue permissions
                permissions.addAll(permissionRepository.findByModule("Issues"));

                // Read-only access to tasks and user stories
                permissions.addAll(permissionRepository.findByMethodAndModule("GET", "Tasks"));
                permissions.addAll(permissionRepository.findByMethodAndModule("GET", "User Stories"));

                // Comment ability
                permissions.addAll(permissionRepository.findByMethodAndModule("POST", "Tasks"));
                permissions.addAll(permissionRepository.findByMethodAndModule("POST", "User Stories"));

                // Wiki access
                permissions.addAll(permissionRepository.findByModule("Wiki"));
            } else if (roleName.equals(ProjectRoleName.BUSINESS_ANALYST.name())) {
                // Business analysts get epic and user story permissions
                permissions.addAll(permissionRepository.findByModule("Epics"));
                permissions.addAll(permissionRepository.findByModule("User Stories"));

                // Read-only access to tasks
                permissions.addAll(permissionRepository.findByMethodAndModule("GET", "Tasks"));

                // Wiki full access
                permissions.addAll(permissionRepository.findByModule("Wiki"));
            }

            // Assign permissions to the role
            role.setPermissions(permissions);
            log.info("Initialized {} permissions for role {}", permissions.size(), roleName);
        } catch (Exception e) {
            log.error("Error initializing permissions for role {}: {}", roleName, e.getMessage(), e);
        }

        return role;
    }
}