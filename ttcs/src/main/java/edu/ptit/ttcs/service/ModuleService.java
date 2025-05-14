package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.ModuleRepository;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectModule;
import edu.ptit.ttcs.entity.Module;
import edu.ptit.ttcs.dao.ProjectModuleRepository;
import edu.ptit.ttcs.dao.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModuleService {

    private final ProjectModuleRepository projectModuleRepository;
    private final ModuleRepository moduleRepository;
    private final ProjectRepository projectRepository;

    public List<ProjectModule> getProjectModules(Long projectId) {
        try {
            // Check if project exists
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Handle null owner to prevent NullPointerException
            handleNullOwner(project);

            return projectModuleRepository.findByProjectId(projectId);
        } catch (Exception e) {
            log.error("Error getting project modules: {}", e.getMessage(), e);
            throw new RuntimeException("Error getting project modules: " + e.getMessage());
        }
    }

    @Transactional
    public List<ProjectModule> updateProjectModules(Long projectId, List<ProjectModule> modules) {
        try {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Handle null owner to prevent NullPointerException
            handleNullOwner(project);

            // Delete existing modules
            projectModuleRepository.deleteByProjectId(projectId);

            // Save new modules
            List<ProjectModule> savedModules = new ArrayList<>();
            for (ProjectModule module : modules) {
                module.setProject(project);
                savedModules.add(projectModuleRepository.save(module));
            }

            return savedModules;
        } catch (Exception e) {
            log.error("Error updating project modules: {}", e.getMessage(), e);
            throw new RuntimeException("Error updating project modules: " + e.getMessage());
        }
    }

    public void initializeProjectModules(Long projectId) {
        try {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Handle null owner to prevent NullPointerException
            handleNullOwner(project);

            // Create 5 default modules with fixed IDs (1-5)
            for (int moduleId = 1; moduleId <= 5; moduleId++) {
                final int finalModuleId = moduleId;
                ProjectModule projectModule = new ProjectModule();
                projectModule.setProject(project);

                // Create Module entity with fixed ID
                Module module = moduleRepository.findById((long) finalModuleId)
                        .orElseThrow(() -> new RuntimeException("Module not found with id: " + finalModuleId));
                projectModule.setModule(module);

                projectModule.setIsOn(false); // Default to disabled - user can enable later
                projectModuleRepository.save(projectModule);
            }
        } catch (Exception e) {
            log.error("Error initializing project modules: {}", e.getMessage(), e);
            throw new RuntimeException("Error initializing project modules: " + e.getMessage());
        }
    }

    /**
     * Handle null owner by setting it to createdBy if available
     * This prevents NullPointerException when accessing project.getOwner().getId()
     */
    private void handleNullOwner(Project project) {
        if (project.getOwner() == null && project.getCreatedBy() != null) {
            log.warn("Project {} has null owner, using createdBy as owner", project.getId());
            project.setOwner(project.getCreatedBy());
            projectRepository.save(project);
        }
    }
}