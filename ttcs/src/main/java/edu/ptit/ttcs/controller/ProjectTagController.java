package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectSettingTag;
import edu.ptit.ttcs.entity.dto.RestResponse;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.service.ProjectSettingServiceT;
import edu.ptit.ttcs.dao.ProjectSettingTagRepository;
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
@RequestMapping("/api/v1/projects/{projectId}/tags")
@RequiredArgsConstructor
@Slf4j
public class ProjectTagController {
    private final ProjectService projectService;
    private final ProjectSettingServiceT projectSettingServiceT;
    private final ProjectSettingTagRepository projectSettingTagRepository;
    
    @GetMapping
    public ResponseEntity<List<ProjectSettingTag>> getAllTags(@PathVariable Long projectId) {
        log.info("Getting tags for project {}", projectId);
        
        try {
            Project project = projectService.findById(projectId);
            List<ProjectSettingTag> tags = projectSettingServiceT.getAllTagByProject(project);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            log.error("Error fetching tags", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<ProjectSettingTag> createTag(
            @PathVariable Long projectId, 
            @RequestBody ProjectSettingTag tag) {
        
        log.info("Creating tag for project {}: {}", projectId, tag);
        
        // Validate request
        if (tag == null) {
            log.error("Tag is null");
            return ResponseEntity.badRequest().build();
        }
        
        log.info("Received tag: name={}, color={}", 
            tag.getName(), tag.getColor());
        
        if (StringUtils.isBlank(tag.getName())) {
            log.error("Tag name is required");
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Project project = projectService.findById(projectId);
            
            // Set project and default values
            tag.setProject(project);
            
            // Default color if not provided
            if (StringUtils.isBlank(tag.getColor())) {
                tag.setColor("#cccccc");
            }
            
            ProjectSettingTag savedTag = projectSettingTagRepository.save(tag);
            log.info("Tag created successfully: {}", savedTag.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedTag);
        } catch (Exception e) {
            log.error("Error creating tag", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{tagId}")
    public ResponseEntity<ProjectSettingTag> updateTag(
            @PathVariable Long projectId, 
            @PathVariable Long tagId, 
            @RequestBody ProjectSettingTag tag) {
        
        try {
            Optional<ProjectSettingTag> optionalExisting = projectSettingTagRepository.findById(tagId);
            if (optionalExisting.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectSettingTag existing = optionalExisting.get();
            
            // Validate project ownership
            if (!existing.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Update fields
            if (tag.getName() != null) {
                existing.setName(tag.getName());
            }
            if (tag.getColor() != null) {
                existing.setColor(tag.getColor());
            }
            
            ProjectSettingTag updatedTag = projectSettingTagRepository.save(existing);
            return ResponseEntity.ok(updatedTag);
        } catch (Exception e) {
            log.error("Error updating tag", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{tagId}")
    public ResponseEntity<Void> deleteTag(
            @PathVariable Long projectId, 
            @PathVariable Long tagId) {
        
        try {
            Optional<ProjectSettingTag> optionalTag = projectSettingTagRepository.findById(tagId);
            if (optionalTag.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectSettingTag tag = optionalTag.get();
            
            // Validate project ownership
            if (!tag.getProject().getId().equals(projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            projectSettingTagRepository.deleteById(tagId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting tag", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 