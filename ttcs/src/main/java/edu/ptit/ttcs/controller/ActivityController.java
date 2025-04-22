package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.dto.ActivityDTO;
import edu.ptit.ttcs.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:5173", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
        RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS })
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @GetMapping("/projects/{projectId}/activities")
    public ResponseEntity<List<ActivityDTO>> getProjectActivities(
            @PathVariable Long projectId,
            @RequestHeader("User-Id") Long userId) {
        try {
            List<ActivityDTO> activities = activityService.getProjectActivities(projectId, userId);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/issues/{issueId}/activities")
    public ResponseEntity<List<ActivityDTO>> getIssueActivities(
            @PathVariable Long issueId,
            @RequestHeader("User-Id") Long userId) {
        try {
            List<ActivityDTO> activities = activityService.getIssueActivities(issueId, userId);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/userstories/{userStoryId}/activities")
    public ResponseEntity<List<ActivityDTO>> getUserStoryActivities(
            @PathVariable Integer userStoryId,
            @RequestHeader("User-Id") Long userId) {
        try {
            List<ActivityDTO> activities = activityService.getUserStoryActivities(userStoryId, userId);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/tasks/{taskId}/activities")
    public ResponseEntity<List<ActivityDTO>> getTaskActivities(
            @PathVariable Integer taskId,
            @RequestHeader("User-Id") Long userId) {
        try {
            List<ActivityDTO> activities = activityService.getTaskActivities(taskId, userId);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/userstories/{userStoryId}/activities")
    public ResponseEntity<ActivityDTO> recordUserStoryActivity(
            @PathVariable Integer userStoryId,
            @RequestHeader("User-Id") Long userId,
            @RequestBody ActivityDTO activityDTO) {
        try {
            ActivityDTO recordedActivity = activityService.recordUserStoryActivity(
                    activityDTO.getProjectId(),
                    userStoryId,
                    userId,
                    activityDTO.getAction(),
                    activityDTO.getDetails());

            return ResponseEntity.ok(recordedActivity);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/tasks/{taskId}/activities")
    public ResponseEntity<ActivityDTO> recordTaskActivity(
            @PathVariable Integer taskId,
            @RequestHeader("User-Id") Long userId,
            @RequestBody ActivityDTO activityDTO) {
        try {
            ActivityDTO recordedActivity = activityService.recordTaskActivity(
                    activityDTO.getProjectId(),
                    taskId,
                    userId,
                    activityDTO.getAction(),
                    activityDTO.getDetails());

            return ResponseEntity.ok(recordedActivity);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}