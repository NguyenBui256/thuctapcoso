package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.dto.ChangePasswordDTO;
import edu.ptit.ttcs.entity.dto.EmailNotificationDTO;
import edu.ptit.ttcs.entity.dto.UpdateUserDTO;
import edu.ptit.ttcs.entity.dto.UserSettingsResponseDTO;
import edu.ptit.ttcs.service.UserSettingsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/user-settings")
public class UserSettingsController {

    @Autowired
    private UserSettingsService userSettingsService;

    @GetMapping
    public ResponseEntity<UserSettingsResponseDTO> getUserSettings() {
        log.info("Getting user settings");
        try {
            UserSettingsResponseDTO settings = userSettingsService.getUserSettings();
            log.info("Successfully retrieved user settings");
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            log.error("Error getting user settings: {}", e.getMessage());
            throw e;
        }
    }

    @PutMapping
    public ResponseEntity<UserSettingsResponseDTO> updateUserSettings(@RequestBody UpdateUserDTO updateUserDTO) {
        log.info("Updating user settings: {}", updateUserDTO);
        try {
            UserSettingsResponseDTO settings = userSettingsService.updateUserSettings(updateUserDTO);
            log.info("Successfully updated user settings");
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            log.error("Error updating user settings: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {
        log.info("Changing password");
        try {
            userSettingsService.changePassword(changePasswordDTO.getCurrentPassword(),
                    changePasswordDTO.getNewPassword());
            log.info("Successfully changed password");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error changing password: {}", e.getMessage());
            throw e;
        }
    }

    @GetMapping("/email-notifications")
    public ResponseEntity<EmailNotificationDTO> getEmailNotifications() {
        log.info("Getting email notifications");
        try {
            EmailNotificationDTO notifications = userSettingsService.getEmailNotifications();
            log.info("Successfully retrieved email notifications");
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error getting email notifications: {}", e.getMessage());
            throw e;
        }
    }

    @PutMapping("/email-notifications")
    public ResponseEntity<EmailNotificationDTO> updateEmailNotifications(
            @RequestBody EmailNotificationDTO emailNotificationDTO) {
        log.info("Updating email notifications: {}", emailNotificationDTO);
        try {
            EmailNotificationDTO notifications = userSettingsService.updateEmailNotifications(emailNotificationDTO);
            log.info("Successfully updated email notifications");
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error updating email notifications: {}", e.getMessage());
            throw e;
        }
    }
}