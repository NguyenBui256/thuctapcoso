package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.dto.request.AddIssueDTO;
import edu.ptit.ttcs.dto.request.CommentRequestDTO;
import edu.ptit.ttcs.entity.dto.request.FilterParams;
import edu.ptit.ttcs.entity.dto.ActivityDTO;
import edu.ptit.ttcs.entity.dto.AttachmentDTO;
import edu.ptit.ttcs.entity.dto.response.CommentResponseDTO;
import edu.ptit.ttcs.entity.dto.response.FilterData;
import edu.ptit.ttcs.entity.dto.response.IssueDTO;
import edu.ptit.ttcs.entity.Attachment;
import edu.ptit.ttcs.entity.Issue;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.dao.AttachmentRepository;
import edu.ptit.ttcs.dao.IssueRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.service.facade.IssueFacadeService;
import edu.ptit.ttcs.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/issue")
public class IssueController {

    private final IssueFacadeService issueService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private SecurityUtils securityUtils;

    @GetMapping("/get-filters")
    public ResponseEntity<FilterData> getFilters(@RequestParam long projectId,
            @ModelAttribute FilterParams filterParams) {
        return ResponseEntity.ok(
                issueService.getFilters(projectId,
                        filterParams));
    }

    @GetMapping("/get-list")
    public ResponseEntity<List<IssueDTO>> getList(@RequestParam long projectId,
            @RequestParam(required = false) Long sprintId,
            @RequestParam(required = false) boolean excludeSprint,
            @RequestParam String sortBy,
            @RequestParam String order,
            @ModelAttribute FilterParams filterParams) {
        return ResponseEntity.ok(issueService.getList(projectId, sprintId, excludeSprint, sortBy, order, filterParams));
    }

    @GetMapping("/get")
    public ResponseEntity<IssueDTO> get(@RequestParam long projectId,
            @RequestParam long issueId) {
        return ResponseEntity.ok(issueService.get(projectId, issueId));
    }

    @PostMapping("/add")
    public ResponseEntity<IssueDTO> create(@RequestParam long projectId,
            @RequestParam(required = false) Long sprintId,
            @RequestParam(required = false) Long epicId,
            @RequestBody @Valid AddIssueDTO dto) {
        return ResponseEntity.ok(issueService.add(
                projectId,
                sprintId,
                epicId,
                dto));
    }

    @PatchMapping("/{issueId}")
    public ResponseEntity<IssueDTO> update(@PathVariable long issueId,
            @RequestBody AddIssueDTO dto) {
        return ResponseEntity.ok(issueService.update(issueId, dto));
    }

    @DeleteMapping("/{issueId}")
    public ResponseEntity<Void> delete(@PathVariable long issueId) {
        issueService.delete(issueId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/attach/{issueId}")
    public ResponseEntity<Void> attach(@PathVariable long issueId,
            @RequestParam long sprintId) {
        issueService.attach(issueId, sprintId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/detach/{issueId}")
    public ResponseEntity<Void> detach(@PathVariable long issueId,
            @RequestParam long sprintId) {
        issueService.detach(issueId, sprintId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{issueId}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable long issueId) {
        return ResponseEntity.ok(issueService.getComments(issueId));
    }

    @PostMapping("/{issueId}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(@PathVariable long issueId,
            @RequestBody CommentRequestDTO commentDTO) {
        return ResponseEntity.ok(issueService.addComment(issueId, commentDTO));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable long commentId) {
        issueService.deleteComment(commentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{issueId}/activities")
    public ResponseEntity<List<ActivityDTO>> getActivities(@PathVariable long issueId) {
        return ResponseEntity.ok(issueService.getActivities(issueId));
    }

    @PostMapping("/{issueId}/attachment")
    public ResponseEntity<?> addAttachment(
            @PathVariable("issueId") Long issueId,
            @RequestBody AttachmentDTO attachmentDTO) {
        try {
            User currentUser = securityUtils.getCurrentUser();

            // Create a new attachment
            Attachment attachment = new Attachment();
            attachment.setFilename(attachmentDTO.getFilename());
            attachment.setContentType(attachmentDTO.getContentType());
            attachment.setFileSize(attachmentDTO.getFileSize());
            attachment.setUrl(attachmentDTO.getUrl());
            attachment.setIsDelete(false);
            attachment.setCreatedAt(LocalDateTime.now());
            attachment.setCreatedBy(currentUser);

            // Save the attachment
            Attachment savedAttachment = attachmentRepository.save(attachment);

            // Find the issue
            Issue issue = issueRepository.findById(issueId)
                    .orElseThrow(() -> new IllegalArgumentException("Issue not found with ID: " + issueId));

            // Add attachment to the issue
            if (issue.getAttachments() == null) {
                issue.setAttachments(new java.util.ArrayList<>());
            }
            issue.getAttachments().add(savedAttachment);
            issueRepository.save(issue);

            // Record activity - this would be better if handled by ActivityService
            // activityService.recordActivity(...);

            return ResponseEntity.ok(issueService.get(issue.getProject().getId(), issueId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add attachment: " + e.getMessage());
        }
    }

    @DeleteMapping("/{issueId}/attachment/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(
            @PathVariable("issueId") Long issueId,
            @PathVariable("attachmentId") Long attachmentId) {
        try {
            User currentUser = securityUtils.getCurrentUser();

            // Find the issue
            Issue issue = issueRepository.findById(issueId)
                    .orElseThrow(() -> new IllegalArgumentException("Issue not found with ID: " + issueId));

            // Find the attachment
            Attachment attachment = attachmentRepository.findById(attachmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Attachment not found with ID: " + attachmentId));

            // Check if the attachment belongs to the issue
            boolean attachmentBelongsToIssue = issue.getAttachments() != null &&
                    issue.getAttachments().stream().anyMatch(a -> a.getId().equals(attachmentId));

            if (!attachmentBelongsToIssue) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Attachment does not belong to this issue");
            }

            // Remove the attachment from the issue's attachments list
            issue.getAttachments().removeIf(a -> a.getId().equals(attachmentId));

            // Save the updated issue
            issueRepository.save(issue);

            // Mark the attachment as deleted but don't actually delete it from the database
            attachment.setIsDelete(true);
            attachmentRepository.save(attachment);

            // Simply log deletion and return the updated issue without trying to record
            // activity
            // Note: If activity recording is needed, the issueService should be enhanced
            // with an appropriate method
            System.out.println("Attachment deleted: " + attachment.getFilename() + " from issue: " + issueId);

            return ResponseEntity.ok(issueService.get(issue.getProject().getId(), issueId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete attachment: " + e.getMessage());
        }
    }
}
