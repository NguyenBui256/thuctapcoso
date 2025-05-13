package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.ModuleRepository;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectModule;
import edu.ptit.ttcs.entity.Module;
import edu.ptit.ttcs.dao.ProjectModuleRepository;
import edu.ptit.ttcs.dao.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleService {

    private final ProjectModuleRepository projectModuleRepository;
    private final ModuleRepository moduleRepository;
    private final ProjectRepository projectRepository;

    public List<ProjectModule> getProjectModules(Long projectId) {
        return projectModuleRepository.findByProjectId(projectId);
    }

    @Transactional
    public List<ProjectModule> updateProjectModules(Long projectId, List<ProjectModule> modules) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Delete existing modules
        projectModuleRepository.deleteByProjectId(projectId);

        // Save new modules
        List<ProjectModule> savedModules = new ArrayList<>();
        for (ProjectModule module : modules) {
            module.setProject(project);
            savedModules.add(projectModuleRepository.save(module));
        }

        return savedModules;
    }

    public void initializeProjectModules(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Create 5 default modules with fixed IDs (1-5)
        for (int i = 1; i <= 5; i++) {
            ProjectModule projectModule = new ProjectModule();
            projectModule.setProject(project);
            
            // Create Module entity with fixed ID
            Module module = new Module();
            module.setId((long) i);
            projectModule.setModule(module);
            
            projectModule.setIsOn(true); // Default to enabled
            projectModuleRepository.save(projectModule);
        }
    }
} 