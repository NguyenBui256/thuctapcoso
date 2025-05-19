package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.dto.ProjectWikiPageDTO;
import edu.ptit.ttcs.entity.dto.ProjectWikiPageRequestDTO;
import edu.ptit.ttcs.entity.dto.AttachmentDTO;
import edu.ptit.ttcs.service.ProjectWikiService;
import edu.ptit.ttcs.util.ApiResponse;
import java.util.List;
import java.util.Set;

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
    public ResponseEntity<ApiResponse<List<ProjectWikiPageDTO>>> getWikiPages(
            @PathVariable Long userId,
            @PathVariable Long projectId) {
        try {
            List<ProjectWikiPageDTO> wikiPages = wikiService.getWikiPages(projectId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Wiki pages retrieved successfully", wikiPages));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping("/{wikiPageId}")
    public ResponseEntity<ApiResponse<ProjectWikiPageDTO>> getWikiPage(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            @PathVariable Long wikiPageId) {
        try {
            ProjectWikiPageDTO wikiPage = wikiService.getWikiPageById(projectId, wikiPageId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Wiki page retrieved successfully", wikiPage));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectWikiPageDTO>> createWikiPage(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            @RequestBody ProjectWikiPageRequestDTO request) {
        try {
            request.validate();
            ProjectWikiPageDTO wikiPage = wikiService.createWikiPage(projectId, request, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Wiki page created successfully", wikiPage));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @PutMapping("/{wikiPageId}")
    public ResponseEntity<ApiResponse<ProjectWikiPageDTO>> updateWikiPage(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            @PathVariable Long wikiPageId,
            @RequestBody ProjectWikiPageRequestDTO request) {
        try {
            request.validate();
            ProjectWikiPageDTO wikiPage = wikiService.updateWikiPage(projectId, wikiPageId, request, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Wiki page updated successfully", wikiPage));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @DeleteMapping("/{wikiPageId}")
    public ResponseEntity<ApiResponse<Void>> deleteWikiPage(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            @PathVariable Long wikiPageId) {
        try {
            wikiService.deleteWikiPage(projectId, wikiPageId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Wiki page deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @PostMapping("/{wikiPageId}/attachment")
    public ResponseEntity<ApiResponse<ProjectWikiPageDTO>> addAttachment(
            @PathVariable Long userId,
            @PathVariable String projectId,
            @PathVariable Long wikiPageId,
            @RequestBody AttachmentDTO attachmentDTO) {
        try {
            Long actualProjectId;
            try {
                actualProjectId = Long.parseLong(projectId);
            } catch (NumberFormatException e) {
                actualProjectId = wikiService.getProjectIdFromWikiPage(wikiPageId);
                if (actualProjectId == null) {
                    return ResponseEntity.badRequest().body(
                            new ApiResponse<>("error",
                                    "Invalid project ID and could not determine project from wiki page", null));
                }
            }

            ProjectWikiPageDTO updatedPage = wikiService.addAttachmentToWikiPage(
                    actualProjectId, wikiPageId, userId, attachmentDTO);
            return ResponseEntity.ok(new ApiResponse<>("success", "Attachment added successfully", updatedPage));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @DeleteMapping("/{wikiPageId}/attachment/{attachmentId}")
    public ResponseEntity<ApiResponse<ProjectWikiPageDTO>> deleteAttachment(
            @PathVariable Long userId,
            @PathVariable String projectId,
            @PathVariable Long wikiPageId,
            @PathVariable Long attachmentId) {
        try {
            Long actualProjectId;
            try {
                actualProjectId = Long.parseLong(projectId);
            } catch (NumberFormatException e) {
                actualProjectId = wikiService.getProjectIdFromWikiPage(wikiPageId);
                if (actualProjectId == null) {
                    return ResponseEntity.badRequest().body(
                            new ApiResponse<>("error",
                                    "Invalid project ID and could not determine project from wiki page", null));
                }
            }

            // Call the service method to delete the attachment
            ProjectWikiPageDTO updatedPage = wikiService.deleteAttachmentFromWikiPage(
                    actualProjectId, wikiPageId, userId, attachmentId);

            return ResponseEntity.ok(new ApiResponse<>("success", "Attachment deleted successfully", updatedPage));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }
}