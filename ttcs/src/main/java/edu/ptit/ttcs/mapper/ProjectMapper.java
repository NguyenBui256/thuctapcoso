package edu.ptit.ttcs.mapper;

import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.entity.Module;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.CreateProjectDTO;
import edu.ptit.ttcs.entity.dto.ProjectDTO;
import edu.ptit.ttcs.dao.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProjectMapper {

    private final ModuleRepository moduleRepository;
    private final UserRepository userRepository;

    public Project toEntity(CreateProjectDTO dto) {
        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setIsPublic(dto.getIsPublic());
        project.setLogoUrl(dto.getLogoUrl());
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        User user = userRepository.findById(dto.getOwnerId())
                .orElseThrow(() -> new RuntimeException("User not found."));
        project.setCreatedBy(user);
        project.setIsDeleted(false);

        // Map project type to module
        Long moduleId = switch (dto.getProjectType()) {
            case "SCRUM" -> 1L;
            case "KANBAN" -> 2L;
            default -> throw new IllegalArgumentException("Invalid project type: " + dto.getProjectType());
        };

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found for ID: " + moduleId));

        Set<Module> modules = new HashSet<>();
        modules.add(module);
        project.setModules(modules);

        return project;
    }

    public Project updateEntity(Project project, CreateProjectDTO dto) {
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setIsPublic(dto.getIsPublic());
        project.setLogoUrl(dto.getLogoUrl());

        // Map project type to module
        Long moduleId = switch (dto.getProjectType()) {
            case "SCRUM" -> 1L;
            case "KANBAN" -> 2L;
            default -> throw new IllegalArgumentException("Invalid project type: " + dto.getProjectType());
        };

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found for ID: " + moduleId));

        Set<Module> modules = new HashSet<>();
        modules.add(module);
        project.setModules(modules);

        return project;
    }

    public ProjectDTO toDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setIsPublic(project.getIsPublic());
        dto.setLogoUrl(project.getLogoUrl());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        dto.setOwnerUsername(project.getCreatedBy() != null ? project.getCreatedBy().getUsername() : "Unknown");

        // Set module ID from the first module (assuming one module per project)
        if (!project.getModules().isEmpty()) {
            Module module = project.getModules().iterator().next();
            dto.setModuleId(module.getId().longValue());
        }

        return dto;
    }

    public List<ProjectDTO> toDTOList(List<Project> projects) {
        return projects.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}