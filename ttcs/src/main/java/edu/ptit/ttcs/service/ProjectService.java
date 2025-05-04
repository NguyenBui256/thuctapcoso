package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.*;
import edu.ptit.ttcs.dao.ModuleRepository;
import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.entity.*;
import edu.ptit.ttcs.entity.Module;
import edu.ptit.ttcs.entity.dto.CreateProjectDTO;
import edu.ptit.ttcs.entity.dto.PageResponse;
import edu.ptit.ttcs.entity.dto.ProjectDTO;
import edu.ptit.ttcs.entity.dto.response.PjStatusDTO;
import edu.ptit.ttcs.entity.enums.ProjectRoleName;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.ModelMap;

import java.time.LocalDateTime;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ModuleRepository moduleRepository;
    private final ProjectMapper projectMapper;
    private final SecurityUtils securityUtils;
    private final UserRepository userRepository;
    private final ProjectRoleRepository projectRoleRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final PjSettingStatusRepository pjSettingStatusRepository;

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

        for (ProjectRoleName roleName : ProjectRoleName.values()) {
            ProjectRole projectRole = new ProjectRole();
            projectRole.setProject(project);
            projectRole.setRoleName(roleName.name());
            projectRole.setCreatedBy(creatorMember);
            projectRole.setUpdatedBy(creatorMember);
            projectRole.setCreatedAt(LocalDateTime.now());
            projectRole.setUpdatedAt(LocalDateTime.now());
            projectRoleRepository.save(projectRole);
            if (roleName == ProjectRoleName.PROJECT_MANAGER) {
                toSetForAdminProjectRole = projectRole;
            }
            log.info("ProjectRole {} - ID: {}", projectRole.getRoleName(), projectRole.getId());
        }

        // Update the created project member with role
        creatorMember.setProjectRole(toSetForAdminProjectRole);
        creatorMember.setCreatedBy(creatorMember);
        creatorMember.setUpdatedBy(creatorMember);
        creatorMember.setCreatedAt(LocalDateTime.now());
        creatorMember.setUpdatedAt(LocalDateTime.now());
        projectMemberRepository.save(creatorMember);
        log.info("ProjectMember ID: {}", creatorMember.getId());

        return project;
    }

    @Transactional
    public Project createProject(CreateProjectDTO createProjectDTO, Long currentUserId) {
        try {
            // Get user from repository
            User creator = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            log.info("Creating project for user ID: {}", currentUserId);

            Project project = new Project();
            project.setName(createProjectDTO.getName());
            project.setDescription(createProjectDTO.getDescription());
            project.setIsPublic(createProjectDTO.getIsPublic());
            project.setLogoUrl(createProjectDTO.getLogoUrl());
            // Can't set createdBy until we have a ProjectMember
            project.setCreatedAt(LocalDateTime.now());
            project.setIsDeleted(false);
            project = projectRepository.save(project);
            log.info("Project created with ID: {}", project.getId());

            // Create default project roles and first member
            ProjectRole managerRole = null;

            // Create project member first
            ProjectMember creatorMember = new ProjectMember();
            creatorMember.setProject(project);
            creatorMember.setUser(creator);
            creatorMember.setIsAdmin(true);
            creatorMember.setCreatedAt(LocalDateTime.now());
            creatorMember.setUpdatedAt(LocalDateTime.now());
            creatorMember = projectMemberRepository.save(creatorMember);
            log.info("Project member created with ID: {}", creatorMember.getId());

            // Now we can set the project's createdBy
            project.setCreatedBy(creator);
            project = projectRepository.save(project);

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
        newProject.setCreatedBy(creator);
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
}