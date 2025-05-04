package edu.ptit.ttcs.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.ptit.ttcs.dao.NotificationRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.entity.Notification;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.NotificationDTO;
import edu.ptit.ttcs.service.NotificationService;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public List<NotificationDTO> getNotificationsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        List<Notification> notifications = notificationRepository.findByReceiver(user);
        
        // Convert entities to DTOs to prevent JSON infinite recursion
        return notifications.stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void markNotificationAsSeen(Integer notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Check if the notification belongs to the user
        if (notification.getReceiver() == null || !notification.getReceiver().getId().equals(user.getId())) {
            throw new IllegalArgumentException("This notification does not belong to you");
        }
        
        // Mark as seen
        notification.setIsSeen(true);
        notificationRepository.save(notification);
    }
} 