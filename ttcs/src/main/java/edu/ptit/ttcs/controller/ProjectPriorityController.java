package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectSettingPriority;
import edu.ptit.ttcs.entity.dto.RestResponse;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.service.ProjectSettingServiceT;
import edu.ptit.ttcs.dao.PjSettingPriorityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/priorities")
@RequiredArgsConstructor
@Slf4j
public class ProjectPriorityController {
    private final ProjectService projectService;
    private final ProjectSettingServiceT projectSettingServiceT;
    private final PjSettingPriorityRepository pjSettingPriorityRepository;
    
    @GetMapping
    public ResponseEntity<List<ProjectSettingPriority>> getAllPriorities(@PathVariable Long projectId) {
        log.info("Getting priorities for project {}", projectId);
        
        try {
            Project project = projectService.findById(projectId);
            List<ProjectSettingPriority> priorities = projectSettingServiceT.getAllPrioByProject(project);
            return ResponseEntity.ok(priorities);
        } catch (Exception e) {
            log.error("Error fetching priorities", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<ProjectSettingPriority> createPriority(
            @PathVariable Long projectId, 
            @RequestBody ProjectSettingPriority priority) {
        
        log.info("Creating priority for project {}: {}", projectId, priority);
        
        // Validate request
        if (priority == null) {
            log.error("Priority is null");
            return ResponseEntity.badRequest().build();
        }
        
        log.info("Received priority: name={}, color={}", 
            priority.getName(), priority.getColor());
        
        if (StringUtils.isBlank(priority.getName())) {
            log.error("Priority name is required");
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Project project = projectService.findById(projectId);
            
            // Set project and default values
            priority.setProject(project);
            if (priority.getOrder() == null) {
                // Get max order and add 1
                Integer maxOrder = pjSettingPriorityRepository.findAllByProject(project)
                    .stream()
                    .map(ProjectSettingPriority::getOrder)
                    .max(Integer::compareTo)
                    .orElse(0);
                priority.setOrder(maxOrder + 1);
            }
            
            priority.setCreatedAt(LocalDateTime.now());
            priority.setUpdatedAt(LocalDateTime.now());
            
            ProjectSettingPriority savedPriority = pjSettingPriorityRepository.save(priority);
            log.info("Priority created successfully: {}", savedPriority.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPriority);
        } catch (Exception e) {
            log.error("Error creating priority", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{priorityId}")
    public ResponseEntity<ProjectSettingPriority> updatePriority(
            @PathVariable Long projectId, 
            @PathVariable Integer priorityId, 
            @RequestBody ProjectSettingPriority priority) {
        
        try {
            Optional<ProjectSettingPriority> optionalExisting = pjSettingPriorityRepository.findById(priorityId);
            if (optionalExisting.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectSettingPriority existing = optionalExisting.get();
            
            // Validate project ownership
            if (!existing.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Update fields
            if (priority.getName() != null) {
                existing.setName(priority.getName());
            }
            if (priority.getColor() != null) {
                existing.setColor(priority.getColor());
            }
            if (priority.getOrder() != null) {
                existing.setOrder(priority.getOrder());
            }
            
            existing.setUpdatedAt(LocalDateTime.now());
            
            ProjectSettingPriority updatedPriority = pjSettingPriorityRepository.save(existing);
            return ResponseEntity.ok(updatedPriority);
        } catch (Exception e) {
            log.error("Error updating priority", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{priorityId}")
    public ResponseEntity<Void> deletePriority(
            @PathVariable Long projectId, 
            @PathVariable Integer priorityId) {
        
        try {
            Optional<ProjectSettingPriority> optionalPriority = pjSettingPriorityRepository.findById(priorityId);
            if (optionalPriority.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectSettingPriority priority = optionalPriority.get();
            
            // Validate project ownership
            if (!priority.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            pjSettingPriorityRepository.deleteById(priorityId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting priority", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 