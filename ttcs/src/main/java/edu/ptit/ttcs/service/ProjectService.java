package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.ModuleRepository;
import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.entity.Module;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.dto.CreateProjectDTO;
import edu.ptit.ttcs.dto.PageResponse;
import edu.ptit.ttcs.dto.ProjectDTO;
import edu.ptit.ttcs.mapper.ProjectMapper;
import edu.ptit.ttcs.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ModuleRepository moduleRepository;
    private final ProjectMapper projectMapper;

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
        return projectRepository.findByOwner(owner);
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
        Project project = projectMapper.toEntity(createProjectDTO);
        project.setCreatedBy(SecurityUtils.getCurrentUser());
        return projectRepository.save(project);
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
        newProject.setCreatedBy(SecurityUtils.getCurrentUser());
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
}