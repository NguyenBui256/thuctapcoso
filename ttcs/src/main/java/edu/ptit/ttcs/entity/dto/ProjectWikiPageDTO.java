package edu.ptit.ttcs.entity.dto;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import edu.ptit.ttcs.entity.*;
import lombok.Data;

@Data
public class ProjectWikiPageDTO {
    private Long id;
    private Long projectId;
    private String title;
    private String content;
    @JsonIgnoreProperties({ "user", "project" })
    private ProjectMember createdBy;
    private String createdByUsername;
    private String createdByAvatar;
    @JsonIgnoreProperties({ "user", "project" })
    private ProjectMember updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer editCount;
    private Set<AttachmentDTO> attachments = new HashSet<>();

    public static ProjectWikiPageDTO fromEntity(ProjectWikiPage entity) {
        if (entity == null) {
            return null;
        }

        ProjectWikiPageDTO dto = new ProjectWikiPageDTO();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProject() != null ? entity.getProject().getId() : null);
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setCreatedBy(entity.getCreatedBy() != null ? (entity.getCreatedBy()) : null);
        dto.setUpdatedBy(entity.getUpdatedBy() != null ? (entity.getUpdatedBy()) : null);
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setEditCount(entity.getEditCount());
        dto.setCreatedByUsername(entity.getCreatedBy() != null ? entity.getCreatedBy().getUser().getUsername() : null);
        dto.setCreatedByAvatar(entity.getCreatedBy() != null ? entity.getCreatedBy().getUser().getAvatar() : null);
        // Convert attachments to DTOs
        if (entity.getAttachments() != null && !entity.getAttachments().isEmpty()) {
            for (Attachment attachment : entity.getAttachments()) {
                dto.getAttachments().add(AttachmentDTO.fromEntity(attachment));
            }
        }

        return dto;
    }
}