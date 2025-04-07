package edu.ptit.ttcs.service;

import java.util.List;

import edu.ptit.ttcs.entity.dto.ActivityDTO;

public interface ActivityService {

    ActivityDTO recordActivity(Long projectId, Long issueId, Long userId, String action, String details);

    List<ActivityDTO> getProjectActivities(Long projectId, Long requestUserId);

    List<ActivityDTO> getIssueActivities(Long issueId, Long requestUserId);
}