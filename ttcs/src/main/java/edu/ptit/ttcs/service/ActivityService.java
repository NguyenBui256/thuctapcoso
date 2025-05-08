package edu.ptit.ttcs.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import edu.ptit.ttcs.entity.dto.ActivityDTO;

public interface ActivityService {

    ActivityDTO recordActivity(Long projectId, Long issueId, Long userId, String action, String details);

    ActivityDTO recordUserStoryActivity(Long projectId, Integer userStoryId, Long userId, String action,
            String details);

    ActivityDTO recordTaskActivity(Long projectId, Integer taskId, Long userId, String action, String details);

    List<ActivityDTO> getProjectActivities(Long projectId, Long requestUserId);

    List<ActivityDTO> getIssueActivities(Long issueId, Long requestUserId);

    List<ActivityDTO> getUserStoryActivities(Integer userStoryId, Long requestUserId);

    List<ActivityDTO> getTaskActivities(Integer taskId, Long requestUserId);

    Page<ActivityDTO> getProjectActivitiesPaginated(Long projectId, Pageable pageable);

}