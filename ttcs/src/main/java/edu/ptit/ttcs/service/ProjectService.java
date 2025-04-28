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

    public List<Project> findByOwner(User owner) {
        return projectRepository.findByCreatedBy(owner);
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

        for (ProjectRoleName roleName : ProjectRoleName.values()) {
            ProjectRole projectRole = new ProjectRole();
            projectRole.setProject(project);
            projectRole.setName(roleName.name());
            projectRole.setCreatedBy(creator);
            projectRole.setUpdatedBy(creator);
            projectRole.setCreatedAt(LocalDateTime.now());
            projectRole.setUpdatedAt(LocalDateTime.now());
            projectRoleRepository.save(projectRole);
            if (roleName == ProjectRoleName.PROJECT_MANAGER) {
                toSetForAdminProjectRole = projectRole;
            }
            log.info("ProjectRole {} - ID: {}", projectRole.getName(), projectRole.getId());
        }

        ProjectMember projectMember = new ProjectMember();
        projectMember.setProject(project);
        projectMember.setUser(creator);
        projectMember.setIsAdmin(true);
        projectMember.setCreatedBy(creator);
        projectMember.setUpdatedBy(creator);
        projectMember.setCreatedAt(LocalDateTime.now());
        projectMember.setUpdatedAt(LocalDateTime.now());
        projectMember.setProjectRole(toSetForAdminProjectRole);
        projectMemberRepository.save(projectMember);
        log.info("ProjectMember ID: {}", projectMember.getId());

        return project;
    }

    public Project createProject(CreateProjectDTO createProjectDTO, Long currentUserId) {
        // Get user from repository
        User creator = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setName(createProjectDTO.getName());
        project.setDescription(createProjectDTO.getDescription());
        project.setCreatedBy(creator);
        project.setCreatedAt(LocalDateTime.now());
        project.setIsDeleted(false);
        project = projectRepository.save(project);

        // Create default project roles
        ProjectRole managerRole = null;
        for (ProjectRoleName roleName : ProjectRoleName.values()) {
            ProjectRole projectRole = new ProjectRole();
            projectRole.setProject(project);
            projectRole.setName(roleName.name());
            projectRole.setCreatedBy(creator);
            projectRole.setUpdatedBy(creator);
            projectRole.setCreatedAt(LocalDateTime.now());
            projectRole.setUpdatedAt(LocalDateTime.now());
            projectRole = projectRoleRepository.save(projectRole);
            if (roleName == ProjectRoleName.PROJECT_MANAGER) {
                managerRole = projectRole;
            }
        }

        // Add creator as project member with PROJECT_MANAGER role
        ProjectMember projectMember = new ProjectMember();
        projectMember.setProject(project);
        projectMember.setUser(creator);
        projectMember.setIsAdmin(true);
        projectMember.setCreatedBy(creator);
        projectMember.setUpdatedBy(creator);
        projectMember.setCreatedAt(LocalDateTime.now());
        projectMember.setUpdatedAt(LocalDateTime.now());
        projectMember.setProjectRole(managerRole);
        projectMemberRepository.save(projectMember);

        return project;
    }

    @Transactional
    public Project duplicateProject(Long projectId, CreateProjectDTO projectDTO) {
        Project sourceProject = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Project newProject = new Project();
        newProject.setName(projectDTO.getName());
        newProject.setDescription(projectDTO.getDescription());
        newProject.setIsPublic(projectDTO.getIsPublic());
        newProject.setLogoUrl(sourceProject.getLogoUrl());
        newProject.setCreatedBy(securityUtils.getCurrentUser());
        newProject.setModules(new HashSet<>(sourceProject.getModules()));
        newProject.setCreatedAt(LocalDateTime.now());
        newProject.setUpdatedAt(LocalDateTime.now());
        newProject.setIsDeleted(false);

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