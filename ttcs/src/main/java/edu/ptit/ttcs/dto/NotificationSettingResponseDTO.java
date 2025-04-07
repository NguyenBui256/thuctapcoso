package edu.ptit.ttcs.dto;

import lombok.Data;

@Data
public class NotificationSettingResponseDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private String notificationType; // "all", "involved", "none"
}