package edu.ptit.ttcs.entity.dto;

import edu.ptit.ttcs.entity.Attachment;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttachmentDTO {
    private Long id;
    private String filename;
    private String contentType;
    private Long fileSize;
    private String url;
    private LocalDateTime createdAt;
    private UserDTO createdBy;

    public static AttachmentDTO fromEntity(Attachment entity) {
        if (entity == null) {
            return null;
        }

        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(entity.getId());
        dto.setFilename(entity.getFilename());
        dto.setContentType(entity.getContentType());
        dto.setFileSize(entity.getFileSize());
        dto.setUrl(entity.getUrl());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setCreatedBy(entity.getCreatedBy() != null ? UserDTO.fromEntity(entity.getCreatedBy()) : null);

        return dto;
    }
}