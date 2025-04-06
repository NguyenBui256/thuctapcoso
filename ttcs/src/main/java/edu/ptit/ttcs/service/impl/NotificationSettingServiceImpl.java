package edu.ptit.ttcs.service.impl;

import edu.ptit.ttcs.dao.NotificationSettingRepository;
import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.entity.NotificationSetting;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.NotificationSettingDTO;
import edu.ptit.ttcs.entity.dto.NotificationSettingResponseDTO;
import edu.ptit.ttcs.service.NotificationSettingService;
import edu.ptit.ttcs.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationSettingServiceImpl implements NotificationSettingService {

    @Autowired
    private NotificationSettingRepository notificationSettingRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Override
    @Transactional
    public NotificationSettingResponseDTO updateNotificationSetting(NotificationSettingDTO settingDTO) {
        User currentUser = SecurityUtils.getCurrentUser();
        Project project = projectRepository.findById(settingDTO.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        NotificationSetting setting = notificationSettingRepository
                .findByUserAndProject(currentUser, project)
                .orElseGet(() -> {
                    NotificationSetting newSetting = new NotificationSetting();
                    newSetting.setUser(currentUser);
                    newSetting.setProject(project);
                    return newSetting;
                });

        setting.setNotificationType(settingDTO.getNotificationType());
        setting = notificationSettingRepository.save(setting);
        return convertToDTO(setting);
    }

    @Override
    public List<NotificationSettingResponseDTO> getUserNotificationSettings() {
        User currentUser = SecurityUtils.getCurrentUser();
        return notificationSettingRepository.findByUser(currentUser)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationSettingResponseDTO getProjectNotificationSetting(Long projectId) {
        User currentUser = SecurityUtils.getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        NotificationSetting setting = notificationSettingRepository
                .findByUserAndProject(currentUser, project)
                .orElseGet(() -> {
                    NotificationSetting newSetting = new NotificationSetting();
                    newSetting.setUser(currentUser);
                    newSetting.setProject(project);
                    newSetting.setNotificationType("all"); // Default notification type
                    return notificationSettingRepository.save(newSetting);
                });

        return convertToDTO(setting);
    }

    private NotificationSettingResponseDTO convertToDTO(NotificationSetting setting) {
        NotificationSettingResponseDTO dto = new NotificationSettingResponseDTO();
        dto.setId(setting.getId());
        dto.setProjectId(setting.getProject().getId());
        dto.setProjectName(setting.getProject().getName());
        dto.setNotificationType(setting.getNotificationType());
        return dto;
    }
}