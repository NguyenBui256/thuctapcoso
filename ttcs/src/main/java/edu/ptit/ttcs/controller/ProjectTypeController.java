package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectSettingType;
import edu.ptit.ttcs.entity.dto.RestResponse;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.service.ProjectSettingServiceT;
import edu.ptit.ttcs.dao.PjSettingTypeRepository;
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
@RequestMapping("/api/v1/projects/{projectId}/types")
@RequiredArgsConstructor
@Slf4j
public class ProjectTypeController {
    private final ProjectService projectService;
    private final ProjectSettingServiceT projectSettingServiceT;
    private final PjSettingTypeRepository pjSettingTypeRepository;
    
    @GetMapping
    public ResponseEntity<List<ProjectSettingType>> getAllTypes(@PathVariable Long projectId) {
        log.info("Getting types for project {}", projectId);
        
        try {
            Project project = projectService.findById(projectId);
            List<ProjectSettingType> types = projectSettingServiceT.getAllTypeByProject(project);
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            log.error("Error fetching types", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<ProjectSettingType> createType(
            @PathVariable Long projectId, 
            @RequestBody ProjectSettingType type) {
        
        log.info("Creating type for project {}: {}", projectId, type);
        
        // Validate request
        if (type == null) {
            log.error("Type is null");
            return ResponseEntity.badRequest().build();
        }
        
        log.info("Received type: name={}, color={}", 
            type.getName(), type.getColor());
        
        if (StringUtils.isBlank(type.getName())) {
            log.error("Type name is required");
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Project project = projectService.findById(projectId);
            
            // Set project and default values
            type.setProject(project);
            if (type.getOrder() == null) {
                // Get max order and add 1
                Integer maxOrder = pjSettingTypeRepository.findAllByProject(project)
                    .stream()
                    .map(ProjectSettingType::getOrder)
                    .max(Integer::compareTo)
                    .orElse(0);
                type.setOrder(maxOrder + 1);
            }
            
            type.setCreatedAt(LocalDateTime.now());
            type.setUpdatedAt(LocalDateTime.now());
            
            ProjectSettingType savedType = pjSettingTypeRepository.save(type);
            log.info("Type created successfully: {}", savedType.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedType);
        } catch (Exception e) {
            log.error("Error creating type", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{typeId}")
    public ResponseEntity<ProjectSettingType> updateType(
            @PathVariable Long projectId, 
            @PathVariable Integer typeId, 
            @RequestBody ProjectSettingType type) {
        
        try {
            Optional<ProjectSettingType> optionalExisting = pjSettingTypeRepository.findById(typeId);
            if (optionalExisting.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectSettingType existing = optionalExisting.get();
            
            // Validate project ownership
            if (!existing.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Update fields
            if (type.getName() != null) {
                existing.setName(type.getName());
            }
            if (type.getColor() != null) {
                existing.setColor(type.getColor());
            }
            if (type.getOrder() != null) {
                existing.setOrder(type.getOrder());
            }
            
            existing.setUpdatedAt(LocalDateTime.now());
            
            ProjectSettingType updatedType = pjSettingTypeRepository.save(existing);
            return ResponseEntity.ok(updatedType);
        } catch (Exception e) {
            log.error("Error updating type", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{typeId}")
    public ResponseEntity<Void> deleteType(
            @PathVariable Long projectId, 
            @PathVariable Integer typeId) {
        
        try {
            Optional<ProjectSettingType> optionalType = pjSettingTypeRepository.findById(typeId);
            if (optionalType.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectSettingType type = optionalType.get();
            
            // Validate project ownership
            if (!type.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            pjSettingTypeRepository.deleteById(typeId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting type", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 