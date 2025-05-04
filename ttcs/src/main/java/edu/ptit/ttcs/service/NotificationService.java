package edu.ptit.ttcs.service;

import java.util.List;

import edu.ptit.ttcs.entity.Notification;
import edu.ptit.ttcs.entity.dto.NotificationDTO;

public interface NotificationService {
    
    /**
     * Get all notifications for a user
     * @param userId The ID of the user
     * @return List of notification DTOs
     */
    List<NotificationDTO> getNotificationsByUserId(Long userId);
    
    /**
     * Mark a notification as seen
     * @param notificationId The ID of the notification
     * @param userId The ID of the user marking the notification
     */
    void markNotificationAsSeen(Integer notificationId, Long userId);
} 