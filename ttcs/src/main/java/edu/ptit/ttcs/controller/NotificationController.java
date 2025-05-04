package edu.ptit.ttcs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.ptit.ttcs.entity.dto.NotificationDTO;
import edu.ptit.ttcs.entity.dto.ProjectMemberDTO;
import edu.ptit.ttcs.service.NotificationService;
import edu.ptit.ttcs.service.ProjectMemberService;
import edu.ptit.ttcs.util.ApiResponse;

@RestController
@RequestMapping("/api/v1/user/{userId}/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private ProjectMemberService projectMemberService;
    
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable Long userId) {
        try {
            List<NotificationDTO> notifications = notificationService.getNotificationsByUserId(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PutMapping("/{notificationId}/seen")
    public ResponseEntity markNotificationAsSeen(@PathVariable Long userId, @PathVariable Integer notificationId) {
        try {
            notificationService.markNotificationAsSeen(notificationId, userId);
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping("/{notificationId}/accept-invitation")
    public ResponseEntity<ProjectMemberDTO> acceptProjectInvitation(
            @PathVariable Long userId, 
            @PathVariable Integer notificationId) {
        try {
            ProjectMemberDTO member = projectMemberService.acceptProjectInvitation(notificationId, userId);
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping("/{notificationId}/reject-invitation")
    public ResponseEntity rejectProjectInvitation(
            @PathVariable Long userId, 
            @PathVariable Integer notificationId) {
        try {
            projectMemberService.rejectProjectInvitation(notificationId, userId);
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
} 