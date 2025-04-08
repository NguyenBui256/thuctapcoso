package edu.ptit.ttcs.service;

import java.util.List;

import edu.ptit.ttcs.entity.dto.NotificationSettingDTO;
import edu.ptit.ttcs.entity.dto.NotificationSettingResponseDTO;

public interface NotificationSettingService {
    NotificationSettingResponseDTO updateNotificationSetting(NotificationSettingDTO settingDTO);

    List<NotificationSettingResponseDTO> getUserNotificationSettings();

    NotificationSettingResponseDTO getProjectNotificationSetting(Long projectId);
}