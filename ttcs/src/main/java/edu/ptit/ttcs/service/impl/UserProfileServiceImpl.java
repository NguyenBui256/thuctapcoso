package edu.ptit.ttcs.service.impl;

import edu.ptit.ttcs.dao.NotificationRepository;
import edu.ptit.ttcs.dao.ProjectMemberRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.dao.UserSettingsRepository;
import edu.ptit.ttcs.entity.Notification;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.UserSettings;
import edu.ptit.ttcs.entity.dto.NotificationDTO;
import edu.ptit.ttcs.entity.dto.UserProfileDTO;
import edu.ptit.ttcs.service.UserProfileService;
import edu.ptit.ttcs.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final SecurityUtils securityUtils;
    private final UserSettingsRepository userSettingsRepository;

    @Override
    public UserProfileDTO getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return buildUserProfile(user);
    }

    @Override
    public UserProfileDTO getCurrentUserProfile() {
        User currentUser = securityUtils.getCurrentUser();
        return buildUserProfile(currentUser);
    }

    private UserProfileDTO buildUserProfile(User user) {
        // Get all user notifications for timeline
        List<Notification> notifications = notificationRepository.findByReceiver(user);
        List<NotificationDTO> timeline = notifications.stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());

        // Get user statistics
        int totalProjects = projectMemberRepository.findByUserAndIsDeleteIsFalse(user).size();
        int closedUserStories = 0; // You may implement this based on your requirements
        int totalContacts = 0; // You may implement this based on your requirements
        Optional<UserSettings> userSettings = userSettingsRepository.findByUser(user);
        return UserProfileDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .bio(userSettings.get().getBio())
                .photoUrl(userSettings.get().getPhotoUrl())
                .totalProjects(totalProjects)
                .closedUserStories(closedUserStories)
                .totalContacts(totalContacts)
                .timeline(timeline)
                .build();
    }
}