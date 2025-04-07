package edu.ptit.ttcs.service.impl;

import edu.ptit.ttcs.dao.*;
import edu.ptit.ttcs.dto.ActivityDTO;
import edu.ptit.ttcs.entity.Activity;
import edu.ptit.ttcs.entity.Issue;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityServiceImpl implements ActivityService {

    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private IssueRepository issueRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Override
    @Transactional
    public ActivityDTO recordActivity(Long projectId, Long issueId, Long userId, String action, String details) {
        Project project = null;
        if (projectId != null) {
            project = projectRepository.findById(projectId.intValue())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        }
        
        Issue issue = null;
        if (issueId != null) {
            issue = issueRepository.findById(issueId)
                    .orElseThrow(() -> new IllegalArgumentException("Issue not found"));
        }
        
        User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Activity activity = new Activity();
        activity.setProject(project);
        activity.setIssue(issue);
        activity.setUser(user);
        activity.setAction(action);
        activity.setDetails(details);
        activity.setTimestamp(LocalDateTime.now());
        
        Activity savedActivity = activityRepository.save(activity);
        
        return mapToDTO(savedActivity);
    }

    @Override
    public List<ActivityDTO> getProjectActivities(Long projectId, Long requestUserId) {
        // Check if requester has access to project
        if (isUserProjectMember(projectId, requestUserId)) {
            throw new IllegalArgumentException("You don't have permission to view project activities");
        }
        
        List<Activity> activities = activityRepository.findByProjectIdOrderByTimestampDesc(projectId);
        return activities.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ActivityDTO> getIssueActivities(Long issueId, Long requestUserId) {
        // First, get the issue to check project access
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found"));
        
        Long projectId = issue.getProject().getId();
        
        // Check if requester has access to project
        if (isUserProjectMember(projectId, requestUserId)) {
            throw new IllegalArgumentException("You don't have permission to view issue activities");
        }
        
        List<Activity> activities = activityRepository.findByIssueIdOrderByTimestampDesc(issueId);
        return activities.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    private ActivityDTO mapToDTO(Activity activity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(activity.getId());
        dto.setProjectId(activity.getProject() != null ? activity.getProject().getId() : null);
        dto.setProjectName(activity.getProject() != null ? activity.getProject().getName() : null);
        dto.setIssueId(activity.getIssue() != null ? activity.getIssue().getId() : null);
        dto.setUserId(activity.getUser() != null ? Long.valueOf(activity.getUser().getId()) : null);
        dto.setUsername(activity.getUser() != null ? activity.getUser().getUsername() : null);
        dto.setUserFullName(activity.getUser() != null ? activity.getUser().getFullName() : null);
        dto.setAction(activity.getAction());
        dto.setDetails(activity.getDetails());
        dto.setTimestamp(activity.getTimestamp());
        return dto;
    }

    boolean isUserProjectMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return !projectMemberRepository.existsByProjectAndUserAndIsDeleteFalse(project, user);
    }
}
