package edu.ptit.ttcs.entity.dto;

import lombok.Data;

@Data
public class NotificationSettingDTO {
    private Long projectId;
    private String notificationType; // "all", "involved", "none"
}