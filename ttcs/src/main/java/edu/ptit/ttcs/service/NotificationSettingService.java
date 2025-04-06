package edu.ptit.ttcs.service;

import edu.ptit.ttcs.entity.dto.NotificationSettingDTO;
import edu.ptit.ttcs.entity.dto.NotificationSettingResponseDTO;

import java.util.List;

public interface NotificationSettingService {
    NotificationSettingResponseDTO updateNotificationSetting(NotificationSettingDTO settingDTO);

    List<NotificationSettingResponseDTO> getUserNotificationSettings();

    NotificationSettingResponseDTO getProjectNotificationSetting(Long projectId);
}