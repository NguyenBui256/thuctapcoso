package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.dto.NotificationSettingDTO;
import edu.ptit.ttcs.dto.NotificationSettingResponseDTO;
import edu.ptit.ttcs.service.NotificationSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications/settings")
public class NotificationSettingController {

    @Autowired
    private NotificationSettingService notificationSettingService;

    @GetMapping
    public ResponseEntity<List<NotificationSettingResponseDTO>> getUserNotificationSettings() {
        return ResponseEntity.ok(notificationSettingService.getUserNotificationSettings());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<NotificationSettingResponseDTO> getProjectNotificationSetting(@PathVariable Long projectId) {
        return ResponseEntity.ok(notificationSettingService.getProjectNotificationSetting(projectId));
    }

    @PutMapping
    public ResponseEntity<NotificationSettingResponseDTO> updateNotificationSetting(
            @RequestBody NotificationSettingDTO settingDTO) {
        return ResponseEntity.ok(notificationSettingService.updateNotificationSetting(settingDTO));
    }
}