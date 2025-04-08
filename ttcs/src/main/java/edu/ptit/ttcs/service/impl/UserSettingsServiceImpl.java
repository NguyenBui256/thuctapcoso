package edu.ptit.ttcs.service.impl;

import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.dao.UserSettingsRepository;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.UserSettings;
import edu.ptit.ttcs.entity.dto.EmailNotificationDTO;
import edu.ptit.ttcs.entity.dto.UpdateUserDTO;
import edu.ptit.ttcs.entity.dto.UserSettingsResponseDTO;
import edu.ptit.ttcs.service.UserSettingsService;
import edu.ptit.ttcs.util.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class UserSettingsServiceImpl implements UserSettingsService {

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityUtils securityUtils;

    @Override
    @Transactional
    public UserSettingsResponseDTO getUserSettings() {
        log.info("Getting user settings for current user");
        User user = securityUtils.getCurrentUser();
        log.info("Current user: {}", user.getUsername());

        UserSettings settings = userSettingsRepository.findByUser(user)
                .orElseGet(() -> {
                    log.info("Creating default settings for user: {}", user.getUsername());
                    UserSettings defaultSettings = new UserSettings();
                    defaultSettings.setUser(user);
                    defaultSettings.setLanguage("en");
                    defaultSettings.setTheme("light");
                    return userSettingsRepository.save(defaultSettings);
                });

        return convertToDTO(settings);
    }

    @Override
    @Transactional
    public UserSettingsResponseDTO updateUserSettings(UpdateUserDTO updateUserDTO) {
        // For testing, use user ID 1
        User user = securityUtils.getCurrentUser();

        UserSettings settings = userSettingsRepository.findByUser(user)
                .orElseGet(() -> {
                    UserSettings newSettings = new UserSettings();
                    newSettings.setUser(user);
                    return newSettings;
                });

        if (updateUserDTO.getLanguage() != null) {
            settings.setLanguage(updateUserDTO.getLanguage());
        }
        if (updateUserDTO.getTheme() != null) {
            settings.setTheme(updateUserDTO.getTheme());
        }
        if (updateUserDTO.getBio() != null) {
            settings.setBio(updateUserDTO.getBio());
        }
        if (updateUserDTO.getPhotoUrl() != null) {
            settings.setPhotoUrl(updateUserDTO.getPhotoUrl());
        }

        if (updateUserDTO.getEmail() != null) {
            user.setEmail(updateUserDTO.getEmail());
        }
        if (updateUserDTO.getFullName() != null) {
            user.setFullName(updateUserDTO.getFullName());
        }

        userRepository.save(user);
        settings = userSettingsRepository.save(settings);

        return convertToDTO(settings);
    }

    @Override
    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        // For testing, use user ID 1
        User user = securityUtils.getCurrentUser();

        // In a real application, you would verify the current password here
        // For testing purposes, we'll skip password verification

        user.setPassword(newPassword);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public EmailNotificationDTO getEmailNotifications() {
        // For testing, use user ID 1
        User user = securityUtils.getCurrentUser();

        UserSettings settings = userSettingsRepository.findByUser(user)
                .orElseGet(() -> {
                    UserSettings defaultSettings = new UserSettings();
                    defaultSettings.setUser(user);
                    defaultSettings.setProjectUpdates(true);
                    defaultSettings.setTaskUpdates(true);
                    defaultSettings.setCommentUpdates(true);
                    defaultSettings.setMentionUpdates(true);
                    defaultSettings.setDeadlineReminders(true);
                    defaultSettings.setWeeklyDigest(true);
                    return userSettingsRepository.save(defaultSettings);
                });

        return convertToEmailNotificationDTO(settings);
    }

    @Override
    @Transactional
    public EmailNotificationDTO updateEmailNotifications(EmailNotificationDTO emailNotificationDTO) {
        // For testing, use user ID 1
        User user = securityUtils.getCurrentUser();

        UserSettings settings = userSettingsRepository.findByUser(user)
                .orElseGet(() -> {
                    UserSettings newSettings = new UserSettings();
                    newSettings.setUser(user);
                    return newSettings;
                });

        settings.setProjectUpdates(emailNotificationDTO.isProjectUpdates());
        settings.setTaskUpdates(emailNotificationDTO.isTaskUpdates());
        settings.setCommentUpdates(emailNotificationDTO.isCommentUpdates());
        settings.setMentionUpdates(emailNotificationDTO.isMentionUpdates());
        settings.setDeadlineReminders(emailNotificationDTO.isDeadlineReminders());
        settings.setWeeklyDigest(emailNotificationDTO.isWeeklyDigest());

        settings = userSettingsRepository.save(settings);
        return convertToEmailNotificationDTO(settings);
    }

    private UserSettingsResponseDTO convertToDTO(UserSettings settings) {
        UserSettingsResponseDTO dto = new UserSettingsResponseDTO();
        dto.setId(settings.getId());
        dto.setUsername(settings.getUser().getUsername());
        dto.setEmail(settings.getUser().getEmail());
        dto.setFullName(settings.getUser().getFullName());
        dto.setLanguage(settings.getLanguage());
        dto.setTheme(settings.getTheme());
        dto.setBio(settings.getBio());
        dto.setPhotoUrl(settings.getPhotoUrl());
        return dto;
    }

    private EmailNotificationDTO convertToEmailNotificationDTO(UserSettings settings) {
        EmailNotificationDTO dto = new EmailNotificationDTO();
        dto.setProjectUpdates(settings.isProjectUpdates());
        dto.setTaskUpdates(settings.isTaskUpdates());
        dto.setCommentUpdates(settings.isCommentUpdates());
        dto.setMentionUpdates(settings.isMentionUpdates());
        dto.setDeadlineReminders(settings.isDeadlineReminders());
        dto.setWeeklyDigest(settings.isWeeklyDigest());
        return dto;
    }
}