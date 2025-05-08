package edu.ptit.ttcs.service.impl;

import edu.ptit.ttcs.dao.*;
import edu.ptit.ttcs.entity.Activity;
import edu.ptit.ttcs.entity.Issue;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.UserStory;
import edu.ptit.ttcs.entity.Task;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.ActivityDTO;
import edu.ptit.ttcs.service.ActivityService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {
        private final ActivityRepository activityRepository;
        private final ProjectRepository projectRepository;
        private final IssueRepository issueRepository;
        private final UserRepository userRepository;
        private final ProjectMemberRepository projectMemberRepository;
        private final UserStoryRepository userStoryRepository;
        private final TaskRepository taskRepository;

        @Override
        @Transactional
        public ActivityDTO recordActivity(Long projectId, Long issueId, Long userId, String action, String details) {
                Project project = null;
                if (projectId != null) {
                        project = projectRepository.findById(projectId)
                                        .orElseThrow(() -> new IllegalArgumentException("Project not found"));
                }

                Issue issue = null;
                if (issueId != null) {
                        issue = issueRepository.findById(issueId)
                                        .orElseThrow(() -> new IllegalArgumentException("Issue not found"));
                }

                User user = userRepository.findById(userId)
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
        @Transactional
        public ActivityDTO recordUserStoryActivity(Long projectId, Integer userStoryId, Long userId, String action,
                        String details) {
                Project project = null;
                if (projectId != null) {
                        project = projectRepository.findById(projectId)
                                        .orElseThrow(() -> new IllegalArgumentException("Project not found"));
                }

                UserStory userStory = null;
                if (userStoryId != null) {
                        userStory = userStoryRepository.findById(userStoryId)
                                        .orElseThrow(() -> new IllegalArgumentException("User Story not found"));
                }

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                Activity activity = new Activity();
                activity.setProject(project);
                activity.setUserStory(userStory);
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
                if (!isUserProjectMember(projectId, requestUserId)) {
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
                if (!isUserProjectMember(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to view issue activities");
                }

                List<Activity> activities = activityRepository.findByIssueIdOrderByTimestampDesc(issueId);
                return activities.stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());
        }

        @Override
        public List<ActivityDTO> getUserStoryActivities(Integer userStoryId, Long requestUserId) {
                // First, get the user story to check project access
                UserStory userStory = userStoryRepository.findById(userStoryId)
                                .orElseThrow(() -> new IllegalArgumentException("User Story not found"));

                Long projectId = userStory.getProject().getId();

                // Check if requester has access to project
                if (!isUserProjectMember(projectId, requestUserId)) {
                        throw new IllegalArgumentException("You don't have permission to view user story activities");
                }

                List<Activity> activities = activityRepository.findByUserStoryIdOrderByTimestampDesc(userStoryId);
                return activities.stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());
        }

        public Page<ActivityDTO> getProjectActivitiesPaginated(Long projectId, Pageable pageable) {
                // Fetch paginated activities from repository
                Page<Activity> activities = activityRepository.findByProjectIdOrderByTimestampDesc(projectId, pageable);

                // Convert to DTOs
                return activities.map(activity -> {
                        ActivityDTO dto = new ActivityDTO();
                        dto.setId(activity.getId());
                        dto.setAction(activity.getAction());
                        dto.setTimestamp(activity.getTimestamp());
                        dto.setDetails(activity.getDetails());
                        if (activity.getUser() != null) {
                                dto.setUserId(activity.getUser().getId());
                                dto.setUsername(activity.getUser().getUsername());
                                dto.setUserFullName(activity.getUser().getFullName());
                        }
                        return dto;
                });
        }

        @Override
        public List<ActivityDTO> getTaskActivities(Integer taskId, Long userId) {
                Task task = taskRepository.findById(taskId)
                                .orElseThrow(() -> new RuntimeException("Task not found"));

                if (task.getProject() == null) {
                        throw new RuntimeException("Task does not have an associated project");
                }

                Long projectId = task.getProject().getId();

                // Check if requester has access to project
                if (!isUserProjectMember(projectId, userId)) {
                        throw new IllegalArgumentException("You don't have permission to view task activities");
                }

                List<Activity> activities = activityRepository.findByTaskIdOrderByTimestampDesc(taskId);
                return activities.stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public ActivityDTO recordTaskActivity(Long projectId, Integer taskId, Long userId, String action,
                        String details) {
                Project project = null;
                if (projectId != null) {
                        project = projectRepository.findById(projectId)
                                        .orElseThrow(() -> new IllegalArgumentException("Project not found"));
                }

                Task task = null;
                if (taskId != null) {
                        task = taskRepository.findById(taskId)
                                        .orElseThrow(() -> new IllegalArgumentException("Task not found"));
                }

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                Activity activity = new Activity();
                activity.setProject(project);
                activity.setTask(task);
                activity.setUser(user);
                activity.setAction(action);
                activity.setDetails(details);
                activity.setTimestamp(LocalDateTime.now());

                Activity savedActivity = activityRepository.save(activity);

                return mapToDTO(savedActivity);
        }

        private boolean isUserProjectMember(Long projectId, Long userId) {
                return projectMemberRepository.existsByProjectIdAndUserIdAndIsDeleteFalse(projectId, userId);
        }

        private ActivityDTO mapToDTO(Activity activity) {
                ActivityDTO dto = new ActivityDTO();
                dto.setId(activity.getId());

                if (activity.getProject() != null) {
                        dto.setProjectId(activity.getProject().getId());
                        dto.setProjectName(activity.getProject().getName());
                }

                if (activity.getIssue() != null) {
                        dto.setIssueId(activity.getIssue().getId());
                }

                if (activity.getUserStory() != null) {
                        dto.setUserStoryId(activity.getUserStory().getId());
                        dto.setUserStoryName(activity.getUserStory().getName());
                }

                if (activity.getUser() != null) {
                        dto.setUserId(activity.getUser().getId());
                        dto.setUsername(activity.getUser().getUsername());
                        dto.setUserFullName(activity.getUser().getFullName());
                }

                dto.setAction(activity.getAction());
                dto.setDetails(activity.getDetails());
                dto.setTimestamp(activity.getTimestamp());

                return dto;
        }
}
