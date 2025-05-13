package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectSettingSeverity;
import edu.ptit.ttcs.entity.dto.RestResponse;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.service.ProjectSettingServiceT;
import edu.ptit.ttcs.dao.PjSettingSeverityRepository;
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
@RequestMapping("/api/v1/projects/{projectId}/severities")
@RequiredArgsConstructor
@Slf4j
public class ProjectSeverityController {
    private final ProjectService projectService;
    private final ProjectSettingServiceT projectSettingServiceT;
    private final PjSettingSeverityRepository pjSettingSeverityRepository;
    
    @GetMapping
    public ResponseEntity<List<ProjectSettingSeverity>> getAllSeverities(@PathVariable Long projectId) {
        log.info("Getting severities for project {}", projectId);
        
        try {
            Project project = projectService.findById(projectId);
            List<ProjectSettingSeverity> severities = projectSettingServiceT.getAllSeverityByProject(project);
            return ResponseEntity.ok(severities);
        } catch (Exception e) {
            log.error("Error fetching severities", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<ProjectSettingSeverity> createSeverity(
            @PathVariable Long projectId, 
            @RequestBody ProjectSettingSeverity severity) {
        
        log.info("Creating severity for project {}: {}", projectId, severity);
        
        // Validate request
        if (severity == null) {
            log.error("Severity is null");
            return ResponseEntity.badRequest().build();
        }
        
        log.info("Received severity: name={}, color={}", 
            severity.getName(), severity.getColor());
        
        if (StringUtils.isBlank(severity.getName())) {
            log.error("Severity name is required");
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Project project = projectService.findById(projectId);
            
            // Set project and default values
            severity.setProject(project);
            if (severity.getOrder() == null) {
                // Get max order and add 1
                Integer maxOrder = pjSettingSeverityRepository.findAllByProject(project)
                    .stream()
                    .map(ProjectSettingSeverity::getOrder)
                    .max(Integer::compareTo)
                    .orElse(0);
                severity.setOrder(maxOrder + 1);
            }
            
            severity.setCreatedAt(LocalDateTime.now());
            severity.setUpdatedAt(LocalDateTime.now());
            
            ProjectSettingSeverity savedSeverity = pjSettingSeverityRepository.save(severity);
            log.info("Severity created successfully: {}", savedSeverity.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSeverity);
        } catch (Exception e) {
            log.error("Error creating severity", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{severityId}")
    public ResponseEntity<ProjectSettingSeverity> updateSeverity(
            @PathVariable Long projectId, 
            @PathVariable Integer severityId, 
            @RequestBody ProjectSettingSeverity severity) {
        
        try {
            Optional<ProjectSettingSeverity> optionalExisting = pjSettingSeverityRepository.findById(severityId);
            if (optionalExisting.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectSettingSeverity existing = optionalExisting.get();
            
            // Validate project ownership
            if (!existing.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Update fields
            if (severity.getName() != null) {
                existing.setName(severity.getName());
            }
            if (severity.getColor() != null) {
                existing.setColor(severity.getColor());
            }
            if (severity.getOrder() != null) {
                existing.setOrder(severity.getOrder());
            }
            
            existing.setUpdatedAt(LocalDateTime.now());
            
            ProjectSettingSeverity updatedSeverity = pjSettingSeverityRepository.save(existing);
            return ResponseEntity.ok(updatedSeverity);
        } catch (Exception e) {
            log.error("Error updating severity", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{severityId}")
    public ResponseEntity<Void> deleteSeverity(
            @PathVariable Long projectId, 
            @PathVariable Integer severityId) {
        
        try {
            Optional<ProjectSettingSeverity> optionalSeverity = pjSettingSeverityRepository.findById(severityId);
            if (optionalSeverity.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectSettingSeverity severity = optionalSeverity.get();
            
            // Validate project ownership
            if (!severity.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            pjSettingSeverityRepository.deleteById(severityId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting severity", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 