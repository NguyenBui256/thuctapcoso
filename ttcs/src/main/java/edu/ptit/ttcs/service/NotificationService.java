package edu.ptit.ttcs.service;

import java.util.List;

import edu.ptit.ttcs.entity.Notification;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.NotificationDTO;

public interface NotificationService {

    /**
     * Get all notifications for a user
     * 
     * @param userId The ID of the user
     * @return List of notification DTOs
     */
    List<NotificationDTO> getNotificationsByUserId(Long userId);

    /**
     * Mark a notification as seen
     * 
     * @param notificationId The ID of the notification
     * @param userId         The ID of the user marking the notification
     */
    void markNotificationAsSeen(Integer notificationId, Long userId);

    /**
     * Create a notification for a user
     * 
     * @param receiver    The user to receive the notification
     * @param description The description of the notification
     * @param objectId    The ID of the object related to the notification
     * @param type        The type of notification
     * @param senderId    The ID of the user sending the notification
     * @return The created notification
     */
    Notification createNotification(User receiver, String description, Integer objectId, String type, Long senderId);
}