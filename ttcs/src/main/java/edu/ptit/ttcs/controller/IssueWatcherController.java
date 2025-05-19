package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.dao.*;
import edu.ptit.ttcs.entity.*;
import edu.ptit.ttcs.service.ActivityService;
import edu.ptit.ttcs.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/issue")
public class IssueWatcherController {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WatcherRepository watcherRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SecurityUtils securityUtils;

    @Autowired
    private ActivityService activityService;

    @GetMapping("/{issueId}/watchers")
    public ResponseEntity<?> getWatchers(@PathVariable Long issueId) {
        try {
            Issue issue = issueRepository.findById(issueId)
                    .orElseThrow(() -> new IllegalArgumentException("Issue not found"));

            List<Watcher> watchers = watcherRepository.findByIssueId(issueId);
            List<Map<String, Object>> watcherList = watchers.stream()
                    .map(watcher -> {
                        User user = watcher.getUser();
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", user.getId());
                        map.put("username", user.getUsername());
                        map.put("fullName", user.getFullName());
                        map.put("avatar", user.getAvatar() != null ? user.getAvatar() : "");
                        return map;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("data", watcherList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{issueId}/watchers")
    public ResponseEntity<?> addWatcher(@PathVariable Long issueId, @RequestBody Map<String, Long> payload) {
        try {
            Long userId = payload.get("userId");
            if (userId == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "User ID is required");
                return ResponseEntity.badRequest().body(error);
            }

            User currentUser = securityUtils.getCurrentUser();
            Issue issue = issueRepository.findById(issueId)
                    .orElseThrow(() -> new IllegalArgumentException("Issue not found"));
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Check if already watching
            Optional<Watcher> existingWatcher = watcherRepository.findByIssueIdAndUserId(issueId, userId);
            if (existingWatcher.isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "User is already watching this issue");
                return ResponseEntity.badRequest().body(error);
            }

            // Create new watcher
            Watcher watcher = new Watcher();
            watcher.setIssue(issue);
            watcher.setUser(user);
            watcherRepository.save(watcher);

            // Record activity
            activityService.recordActivity(
                    issue.getProject().getId(),
                    issueId,
                    currentUser.getId(),
                    "watcher_added",
                    "User " + user.getUsername() + " started watching issue: " + issue.getSubject());

            // Send notification to the watcher
            createWatcherNotification(user, issue, currentUser.getId());

            Map<String, Object> success = new HashMap<>();
            success.put("success", true);
            return ResponseEntity.ok(success);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{issueId}/watchers/{watcherId}")
    public ResponseEntity<?> removeWatcher(@PathVariable Long issueId, @PathVariable Long watcherId) {
        try {
            User currentUser = securityUtils.getCurrentUser();
            Issue issue = issueRepository.findById(issueId)
                    .orElseThrow(() -> new IllegalArgumentException("Issue not found"));
            User user = userRepository.findById(watcherId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            Optional<Watcher> watcherOpt = watcherRepository.findByIssueIdAndUserId(issueId, watcherId);
            if (!watcherOpt.isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "User is not watching this issue");
                return ResponseEntity.badRequest().body(error);
            }

            watcherRepository.delete(watcherOpt.get());

            // Record activity
            activityService.recordActivity(
                    issue.getProject().getId(),
                    issueId,
                    currentUser.getId(),
                    "watcher_removed",
                    "User " + user.getUsername() + " stopped watching issue: " + issue.getSubject());

            Map<String, Object> success = new HashMap<>();
            success.put("success", true);
            return ResponseEntity.ok(success);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Create notification for user added as a watcher to an issue
     */
    private void createWatcherNotification(User receiver, Issue issue, Long senderId) {
        Notification notification = new Notification();
        notification.setReceiver(receiver);
        notification.setDescription("You have been added as a watcher to issue: " + issue.getSubject());
        notification.setObjectId(issue.getId().intValue());
        notification.setType("ISSUE_WATCHING");
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        notification.setCreatedBy(sender);
        notification.setUpdatedBy(sender);
        notification.setIsSeen(false);

        notificationRepository.save(notification);
    }
}