package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectSettingStatus;
import edu.ptit.ttcs.entity.dto.RestResponse;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.service.ProjectSettingServiceT;
import edu.ptit.ttcs.dao.PjSettingStatusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cglib.core.Local;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/statuses")
@RequiredArgsConstructor
@Slf4j
public class ProjectStatusController {
    private final ProjectService projectService;
    private final ProjectSettingServiceT projectSettingServiceT;
    private final PjSettingStatusRepository pjSettingStatusRepository;
    
    private static final List<String> VALID_STATUS_TYPES = Arrays.asList("userstory", "task", "issue");

    @GetMapping
    public ResponseEntity<List<ProjectSettingStatus>> getAllStatuses(
            @PathVariable Long projectId, 
            @RequestParam(required = false, defaultValue = "userstory") String type) {
        
        if (!VALID_STATUS_TYPES.contains(type)) {
            log.warn("Invalid status type requested: {}", type);
            return ResponseEntity.badRequest().build();
        }
        
        log.info("Getting statuses for project {} of type {}", projectId, type);
        
        try {
            Project project = projectService.findById(projectId);
            List<ProjectSettingStatus> statuses = projectSettingServiceT.getAllStatusByProject(project, type);
            return ResponseEntity.ok(statuses);
        } catch (Exception e) {
            log.error("Error fetching statuses", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<ProjectSettingStatus> createStatus(
            @PathVariable Long projectId, 
            @RequestBody ProjectSettingStatus status) {
        
        log.info("Creating status for project {}: {}", projectId, status);
        
        // Validate request
        if (status == null) {
            log.error("Status is null");
            return ResponseEntity.badRequest().build();
        }
        
        log.info("Received status: name={}, slug={}, type={}, color={}", 
            status.getName(), status.getSlug(), status.getType(), status.getColor());
        
        if (StringUtils.isBlank(status.getName())) {
            log.error("Status name is required");
            return ResponseEntity.badRequest().build();
        }
        
        if (StringUtils.isBlank(status.getType()) || !VALID_STATUS_TYPES.contains(status.getType())) {
            log.error("Invalid status type: {}", status.getType());
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Project project = projectService.findById(projectId);
            
            // Generate slug if not provided or empty
            if (StringUtils.isBlank(status.getSlug())) {
                String generatedSlug = status.getName().toLowerCase().replace(' ', '-');
                status.setSlug(generatedSlug);
                log.info("Generated slug '{}' from name '{}'", generatedSlug, status.getName());
            }
            
            // Check for duplicate slug
            boolean slugExists = projectSettingServiceT.getAllStatusByProject(project, status.getType())
                .stream()
                .anyMatch(s -> s.getSlug().equals(status.getSlug()));
                
            if (slugExists) {
                log.error("Status with slug '{}' already exists", status.getSlug());
                return ResponseEntity.badRequest().build();
            }
            
            // Set project and default values
            status.setProject(project);
            if (status.getOrder() == null) {
                // Get max order and add 1
                Integer maxOrder = pjSettingStatusRepository.findAllByProjectAndType(project, status.getType())
                    .stream()
                    .map(ProjectSettingStatus::getOrder)
                    .max(Integer::compareTo)
                    .orElse(0);
                status.setOrder(maxOrder + 1);
            }
            
            if (status.getClosed() == null) {
                status.setClosed(false);
            }
            
            if (status.getArchived() == null) {
                status.setArchived(false);
            }

            status.setCreatedAt(LocalDateTime.now());
            status.setUpdatedAt(LocalDateTime.now());
            
            ProjectSettingStatus savedStatus = pjSettingStatusRepository.save(status);
            log.info("Status created successfully: {}", savedStatus.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedStatus);
        } catch (Exception e) {
            log.error("Error creating status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{statusId}")
    public ResponseEntity<ProjectSettingStatus> updateStatus(
            @PathVariable Long projectId, 
            @PathVariable Integer statusId, 
            @RequestBody ProjectSettingStatus status) {
        
        try {
            Optional<ProjectSettingStatus> optionalExisting = pjSettingStatusRepository.findById(statusId);
            if (optionalExisting.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectSettingStatus existing = optionalExisting.get();
            
            // Validate project ownership
            if (!existing.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Check slug uniqueness if changed
            if (status.getSlug() != null && !status.getSlug().equals(existing.getSlug())) {
                boolean slugExists = projectSettingServiceT.getAllStatusByProject(existing.getProject(), existing.getType())
                    .stream()
                    .filter(s -> !s.getId().equals(statusId))
                    .anyMatch(s -> s.getSlug().equals(status.getSlug()));
                    
                if (slugExists) {
                    return ResponseEntity.badRequest().build();
                }
            }
            
            // Update fields
            if (status.getName() != null) {
                existing.setName(status.getName());
            }
            if (status.getColor() != null) {
                existing.setColor(status.getColor());
            }
            if (status.getSlug() != null) {
                existing.setSlug(status.getSlug());
            }
            if (status.getOrder() != null) {
                existing.setOrder(status.getOrder());
            }
            if (status.getClosed() != null) {
                existing.setClosed(status.getClosed());
            }
            if (status.getArchived() != null) {
                existing.setArchived(status.getArchived());
            }
            
            // Don't allow changing the type
            // existing.setType(status.getType());
            
            existing.setUpdatedAt(LocalDateTime.now());
            
            ProjectSettingStatus updatedStatus = pjSettingStatusRepository.save(existing);
            return ResponseEntity.ok(updatedStatus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{statusId}")
    public ResponseEntity<Void> deleteStatus(
            @PathVariable Long projectId, 
            @PathVariable Integer statusId) {
        
        try {
            Optional<ProjectSettingStatus> optionalStatus = pjSettingStatusRepository.findById(statusId);
            if (optionalStatus.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectSettingStatus status = optionalStatus.get();
            
            // Validate project ownership
            if (!status.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            pjSettingStatusRepository.deleteById(statusId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 