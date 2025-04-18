package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.dto.ProjectWikiPageDTO;
import edu.ptit.ttcs.entity.dto.ProjectWikiPageRequestDTO;
import edu.ptit.ttcs.service.ProjectWikiService;
import edu.ptit.ttcs.util.ApiResponse;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user/{userId}/project/{projectId}/wiki")
@RequiredArgsConstructor
public class ProjectWikiController {

    private final ProjectWikiService wikiService;
    
    @GetMapping
    public ResponseEntity<List<ProjectWikiPageDTO>> getWikiPages(
            @PathVariable Long userId,
            @PathVariable Long projectId) {
        try {
            List<ProjectWikiPageDTO> wikiPages = wikiService.getWikiPages(projectId, userId);
            return ResponseEntity.ok(wikiPages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @GetMapping("/{wikiPageId}")
    public ResponseEntity<ProjectWikiPageDTO> getWikiPage(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            @PathVariable Long wikiPageId) {
        try {
            ProjectWikiPageDTO wikiPage = wikiService.getWikiPageById(projectId, wikiPageId, userId);
            return ResponseEntity.ok(wikiPage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping
    public ResponseEntity<ProjectWikiPageDTO> createWikiPage(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            @RequestBody ProjectWikiPageRequestDTO request) {
        try {
            request.validate();
            ProjectWikiPageDTO wikiPage = wikiService.createWikiPage(projectId, request, userId);
            return ResponseEntity.ok(wikiPage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PutMapping("/{wikiPageId}")
    public ResponseEntity<ProjectWikiPageDTO> updateWikiPage(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            @PathVariable Long wikiPageId,
            @RequestBody ProjectWikiPageRequestDTO request) {
        try {
            request.validate();
            ProjectWikiPageDTO wikiPage = wikiService.updateWikiPage(projectId, wikiPageId, request, userId);
            return ResponseEntity.ok(wikiPage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @DeleteMapping("/{wikiPageId}")
    public ResponseEntity<Void> deleteWikiPage(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            @PathVariable Long wikiPageId) {
        try {
            wikiService.deleteWikiPage(projectId, wikiPageId, userId);
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
} 