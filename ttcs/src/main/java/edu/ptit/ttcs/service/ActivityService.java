package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dto.ActivityDTO;

import java.util.List;

public interface ActivityService {
    
    ActivityDTO recordActivity(Long projectId, Long issueId, Long userId, String action, String details);
    
    List<ActivityDTO> getProjectActivities(Long projectId, Long requestUserId);
    
    List<ActivityDTO> getIssueActivities(Long issueId, Long requestUserId);
} 