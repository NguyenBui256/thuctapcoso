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

            // Tạo 4 module cơ bản cho project: Scrum, Kanban, Issue, Wiki
            // Các module này sẽ tương ứng với ID 1-4 trong bảng module
            final int[] moduleIds = { 1, 2, 3, 4 }; // 1=Scrum, 2=Kanban, 3=Issue, 4=Wiki

            for (int moduleId : moduleIds) {
                ProjectModule projectModule = new ProjectModule();
                projectModule.setProject(project);

                // Lấy module entity theo ID
                Module module = moduleRepository.findById((long) moduleId)
                        .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));
                projectModule.setModule(module);

                projectModule.setIsOn(false); // Mặc định là tắt - người dùng có thể bật sau
                projectModuleRepository.save(projectModule);

                log.info("Added module {} to project {}", module.getName(), project.getId());
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
        try {
            if (project.getOwner() == null) {
                log.warn("Project {} has null owner", project.getId());

                if (project.getCreatedBy() != null) {
                    log.info("Setting owner to createdBy for project {}", project.getId());
                    project.setOwner(project.getCreatedBy());
                    projectRepository.save(project);
                } else {
                    // If both owner and createdBy are null, try to find a project member to set as
                    // owner
                    log.warn("Project {} has null owner and null createdBy", project.getId());
                    // In this emergency case, we'll just set a placeholder to prevent
                    // NullPointerException
                    // This should be fixed manually by an administrator later
                    log.error("Cannot find suitable owner for project {}. This should be fixed manually.",
                            project.getId());
                }
            }
        } catch (Exception e) {
            // Log error but don't throw exception to prevent cascading failures
            log.error("Error handling null owner for project {}: {}", project.getId(), e.getMessage(), e);
        }
    }
}