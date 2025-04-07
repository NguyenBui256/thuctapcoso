package edu.ptit.ttcs.service;

import edu.ptit.ttcs.entity.dto.EmailNotificationDTO;
import edu.ptit.ttcs.entity.dto.UpdateUserDTO;
import edu.ptit.ttcs.entity.dto.UserSettingsResponseDTO;

public interface UserSettingsService {
    UserSettingsResponseDTO getUserSettings();

    UserSettingsResponseDTO updateUserSettings(UpdateUserDTO updateUserDTO);

    void changePassword(String currentPassword, String newPassword);

    EmailNotificationDTO getEmailNotifications();

    EmailNotificationDTO updateEmailNotifications(EmailNotificationDTO emailNotificationDTO);
}