package edu.ptit.ttcs.entity.dto;

import edu.ptit.ttcs.entity.Notification;
import edu.ptit.ttcs.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Integer id;
    private String description;
    private Integer objectId;
    private String type;
    private Boolean isSeen;
    private LocalDateTime createdAt;

    // Simplified user information for receiver
    private Long receiverId;
    private String receiverUsername;
    private String receiverFullName;
    private String receiverPhotoUrl;

    // Simplified user information for creator
    private Long createdById;
    private String createdByUsername;
    private String createdByFullName;
    private String createdByPhotoUrl;

    /**
     * Factory method to create a DTO from an entity
     */
    public static NotificationDTO fromEntity(Notification notification) {
        NotificationDTO dto = new NotificationDTO();

        // Basic fields
        dto.setId(notification.getId());
        dto.setDescription(notification.getDescription());
        dto.setObjectId(notification.getObjectId());
        dto.setType(notification.getType());
        dto.setIsSeen(notification.getIsSeen());
        dto.setCreatedAt(notification.getCreatedAt());

        // Receiver fields
        User receiver = notification.getReceiver();
        if (receiver != null) {
            dto.setReceiverId(receiver.getId());
            dto.setReceiverUsername(receiver.getUsername());
            dto.setReceiverFullName(receiver.getFullName());
        }

        // Creator fields
        User createdBy = notification.getCreatedBy();
        if (createdBy != null) {
            dto.setCreatedById(createdBy.getId());
            dto.setCreatedByUsername(createdBy.getUsername());
            dto.setCreatedByFullName(createdBy.getFullName());
        }

        return dto;
    }
}