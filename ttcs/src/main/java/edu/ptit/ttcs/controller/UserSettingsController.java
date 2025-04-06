package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.dto.ChangePasswordDTO;
import edu.ptit.ttcs.entity.dto.EmailNotificationDTO;
import edu.ptit.ttcs.entity.dto.UpdateUserDTO;
import edu.ptit.ttcs.entity.dto.UserSettingsResponseDTO;
import edu.ptit.ttcs.service.UserSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-settings")
@CrossOrigin(origins = "http://localhost:5173")
public class UserSettingsController {

    @Autowired
    private UserSettingsService userSettingsService;

    @GetMapping
    public ResponseEntity<UserSettingsResponseDTO> getUserSettings() {
        return ResponseEntity.ok(userSettingsService.getUserSettings());
    }

    @PutMapping
    public ResponseEntity<UserSettingsResponseDTO> updateUserSettings(@RequestBody UpdateUserDTO updateUserDTO) {
        return ResponseEntity.ok(userSettingsService.updateUserSettings(updateUserDTO));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {
        userSettingsService.changePassword(changePasswordDTO.getCurrentPassword(), changePasswordDTO.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/email-notifications")
    public ResponseEntity<EmailNotificationDTO> getEmailNotifications() {
        return ResponseEntity.ok(userSettingsService.getEmailNotifications());
    }

    @PutMapping("/email-notifications")
    public ResponseEntity<EmailNotificationDTO> updateEmailNotifications(
            @RequestBody EmailNotificationDTO emailNotificationDTO) {
        return ResponseEntity.ok(userSettingsService.updateEmailNotifications(emailNotificationDTO));
    }
}