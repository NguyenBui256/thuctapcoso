package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.dto.ActivityDTO;
import edu.ptit.ttcs.service.ActivityService;
import edu.ptit.ttcs.util.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @GetMapping("/projects/{projectId}/activities")
    public ResponseEntity<ApiResponse<List<ActivityDTO>>> getProjectActivities(
            @PathVariable Long projectId,
            @RequestHeader("User-Id") Long userId) {
        try {
            List<ActivityDTO> activities = activityService.getProjectActivities(projectId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Project activities retrieved successfully", activities));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }

    @GetMapping("/issues/{issueId}/activities")
    public ResponseEntity<ApiResponse<List<ActivityDTO>>> getIssueActivities(
            @PathVariable Long issueId,
            @RequestHeader("User-Id") Long userId) {
        try {
            List<ActivityDTO> activities = activityService.getIssueActivities(issueId, userId);
            return ResponseEntity.ok(new ApiResponse<>("success", "Issue activities retrieved successfully", activities));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null));
        }
    }
}