package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dto.EmailNotificationDTO;
import edu.ptit.ttcs.dto.UpdateUserDTO;
import edu.ptit.ttcs.dto.UserSettingsResponseDTO;

public interface UserSettingsService {
    UserSettingsResponseDTO getUserSettings();

    UserSettingsResponseDTO updateUserSettings(UpdateUserDTO updateUserDTO);

    void changePassword(String currentPassword, String newPassword);

    EmailNotificationDTO getEmailNotifications();

    EmailNotificationDTO updateEmailNotifications(EmailNotificationDTO emailNotificationDTO);
}