package edu.ptit.ttcs.dto;

import lombok.Data;

@Data
public class NotificationSettingDTO {
    private Long projectId;
    private String notificationType; // "all", "involved", "none"
}