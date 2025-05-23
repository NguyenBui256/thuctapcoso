package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.entity.UserStory;
import edu.ptit.ttcs.entity.Task;
import edu.ptit.ttcs.entity.TaskAttachment;
import edu.ptit.ttcs.entity.ProjectSettingStatus;
import edu.ptit.ttcs.entity.Sprint;
import edu.ptit.ttcs.dao.UserStoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.HashMap;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.Arrays;

import edu.ptit.ttcs.entity.dto.UserStoryDTO;
import edu.ptit.ttcs.entity.dto.TaskDTO;
import edu.ptit.ttcs.entity.dto.CommentDTO;
import edu.ptit.ttcs.service.KanbanUserStoryService;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.UserSettings;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.dao.UserSettingsRepository;
import edu.ptit.ttcs.entity.dto.KanbanTaskDTO;
import edu.ptit.ttcs.service.KanbanTaskService;
import edu.ptit.ttcs.entity.dto.UserStoryResponseDTO;
import edu.ptit.ttcs.entity.KanbanSwimland;
import edu.ptit.ttcs.entity.dto.UserDTO;
import edu.ptit.ttcs.dao.ProjectMemberRepository;
import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.service.ActivityService;
import edu.ptit.ttcs.entity.dto.ActivityDTO;
import jakarta.servlet.http.HttpServletRequest;
import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.dao.TaskAttachmentRepository;
import edu.ptit.ttcs.dao.TaskRepository;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.dao.CommentRepository;
import edu.ptit.ttcs.entity.Comment;
import edu.ptit.ttcs.util.SecurityUtils;
import edu.ptit.ttcs.entity.Attachment;
import edu.ptit.ttcs.dao.AttachmentRepository;
import edu.ptit.ttcs.entity.dto.AttachmentDTO;
import edu.ptit.ttcs.controller.TaskController;
import edu.ptit.ttcs.entity.Notification;
import edu.ptit.ttcs.dao.NotificationRepository;
import edu.ptit.ttcs.service.UserStoryService;
import edu.ptit.ttcs.entity.dto.response.PjStatusDTO;
import edu.ptit.ttcs.exception.RequestException;
import edu.ptit.ttcs.entity.ProjectSettingTag;
import edu.ptit.ttcs.dao.ProjectSettingTagRepository;
import edu.ptit.ttcs.entity.Activity;
import edu.ptit.ttcs.service.NotificationService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Inner class for block response to avoid issues with the DTO
class UserStoryBlockResponse {
    private Integer id;
    private String name;
    private String description;
    private Boolean blocked;
    private Integer statusId;

    public UserStoryBlockResponse(UserStory story) {
        this.id = story.getId();
        this.name = story.getName();
        this.description = story.getDescription();
        this.blocked = story.getIsBlock();
        if (story.getStatus() != null) {
            this.statusId = story.getStatus().getId();
        }
    }

    // Getters
    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Boolean getBlocked() {
        return blocked;
    }

    public Integer getStatusId() {
        return statusId;
    }
}

@RestController
@RequestMapping("/api/kanban/board")
@CrossOrigin(origins = "http://localhost:5173", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
        RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowedHeaders = { "Content-Type",
                "Authorization", "User-Id" }, exposedHeaders = { "Content-Type", "Authorization", "User-Id" })
public class UserStoryController {

    @Autowired
    private UserStoryRepository userStoryRepository;

    @Autowired
    private UserSettingsRepository userSettingsRepository;
    @Autowired
    private KanbanUserStoryService kanbanUserStoryService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskAttachmentRepository taskAttachmentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private KanbanTaskService kanbanTaskService;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private ActivityService activityService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private SecurityUtils securityUtils;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private TaskController taskController;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserStoryService userStoryService;

    @Autowired
    private ProjectSettingTagRepository projectSettingTagRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/userstory")
    public List<UserStory> getUserStoriesByStatus(@RequestParam("statusId") Integer statusId) {
        List<UserStory> userStories = userStoryRepository.findByStatusId(statusId);

        // Lọc bỏ các user story đã bị đánh dấu xóa (nếu vẫn còn lọt qua query
        // repository)
        return userStories.stream()
                .filter(story -> story.getIsDeleted() == null || !story.getIsDeleted())
                .collect(Collectors.toList());
    }

    @GetMapping("/userstory/task")
    public List<Task> getTasksByUserStory(@RequestParam("userStoryId") Integer userStoryId) {
        return userStoryRepository.findTasksByUserStoryId(userStoryId);
    }

    @PostMapping("/userstory")
    public ResponseEntity<?> createUserStory(@RequestBody Map<String, Object> requestMap) {
        try {
            UserStory userStory = new UserStory();
            List<Integer> userIds = new ArrayList<>();

            // Extract user story properties from the map
            if (requestMap.containsKey("name")) {
                userStory.setName((String) requestMap.get("name"));
            }

            if (requestMap.containsKey("description")) {
                userStory.setDescription((String) requestMap.get("description"));
            }

            if (requestMap.containsKey("project")) {
                Map<String, Object> projectMap = (Map<String, Object>) requestMap.get("project");
                if (projectMap != null && projectMap.containsKey("id")) {
                    Project project = new Project();
                    project.setId(((Number) projectMap.get("id")).longValue());
                    userStory.setProject(project);
                }
            }

            if (requestMap.containsKey("status")) {
                Map<String, Object> statusMap = (Map<String, Object>) requestMap.get("status");
                if (statusMap != null && statusMap.containsKey("id")) {
                    ProjectSettingStatus status = new ProjectSettingStatus();
                    status.setId(((Number) statusMap.get("id")).intValue());
                    userStory.setStatus(status);
                }
            }

            if (requestMap.containsKey("swimlane")) {
                Map<String, Object> swimlaneMap = (Map<String, Object>) requestMap.get("swimlane");
                if (swimlaneMap != null && swimlaneMap.containsKey("id")) {
                    KanbanSwimland swimlane = new KanbanSwimland();
                    swimlane.setId(((Number) swimlaneMap.get("id")).intValue());
                    userStory.setSwimlane(swimlane);
                }
            }

            if (requestMap.containsKey("sprint")) {
                Map<String, Object> springMap = (Map<String, Object>) requestMap.get("sprint");
                if (springMap != null && springMap.containsKey("id")) {
                    Sprint sprint = new Sprint();
                    sprint.setId(((Number) springMap.get("id")).longValue());
                    userStory.setSprint(sprint);
                }
            }

            // Get current authenticated user
            User currentUser = null;
            try {
                currentUser = securityUtils.getCurrentUser();
            } catch (Exception e) {
                // Handle case when current user cannot be retrieved
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            // Get user ID for creator
            Long creatorUserId = null;

            if (currentUser != null) {
                creatorUserId = currentUser.getId();
            } else if (requestMap.containsKey("createdBy")) {
                // Fallback to request parameter if current user is null
                Map<String, Object> createdByMap = (Map<String, Object>) requestMap.get("createdBy");
                if (createdByMap != null && createdByMap.containsKey("id")) {
                    creatorUserId = ((Number) createdByMap.get("id")).longValue();
                }
            }

            if (requestMap.containsKey("dueDate")) {
                String dueDateStr = (String) requestMap.get("dueDate");
                if (dueDateStr != null && !dueDateStr.isEmpty()) {
                    try {
                        LocalDate dueDate = LocalDate.parse(dueDateStr);
                        userStory.setDueDate(dueDate);
                    } catch (Exception e) {
                        // Ignore parsing errors for due date
                    }
                }
            }

            if (requestMap.containsKey("isBlock")) {
                userStory.setIsBlock((Boolean) requestMap.get("isBlock"));
            }

            if (requestMap.containsKey("uxPoints")) {
                userStory.setUxPoints(((Number) requestMap.get("uxPoints")).intValue());
            }

            if (requestMap.containsKey("backPoints")) {
                userStory.setBackPoints(((Number) requestMap.get("backPoints")).intValue());
            }

            if (requestMap.containsKey("frontPoints")) {
                userStory.setFrontPoints(((Number) requestMap.get("frontPoints")).intValue());
            }

            if (requestMap.containsKey("designPoints")) {
                userStory.setDesignPoints(((Number) requestMap.get("designPoints")).intValue());
            }

            // Set creation and update timestamps
            LocalDateTime now = LocalDateTime.now();
            userStory.setCreatedAt(now);
            userStory.setUpdatedAt(now);

            // Ensure required fields are set
            if (userStory.getName() == null || userStory.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("User story name is required");
            }

            // Ensure project is set and get it from database
            if (userStory.getProject() == null) {
                return ResponseEntity.badRequest().body("Project is required");
            }
            Optional<Project> existingProject = projectRepository.findById(userStory.getProject().getId());
            if (!existingProject.isPresent()) {
                return ResponseEntity.badRequest().body("Project not found");
            }
            userStory.setProject(existingProject.get());

            // Initialize collections to avoid null pointer exceptions
            if (userStory.getAssignedUsers() == null) {
                userStory.setAssignedUsers(new HashSet<>());
            }
            if (userStory.getWatchers() == null) {
                userStory.setWatchers(new HashSet<>());
            }
            if (userStory.getTags() == null) {
                userStory.setTags(new HashSet<>());
            }

            // Get creator ProjectMember if creator user ID is available
            if (creatorUserId != null) {
                ProjectMember creatorMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                        userStory.getProject().getId(), creatorUserId);

                if (creatorMember != null) {
                    userStory.setCreatedBy(creatorMember);
                } else {
                    return ResponseEntity.badRequest().body("Creator user is not a member of this project");
                }
            }

            // Extract user IDs if present
            if (requestMap.containsKey("userIds")) {
                List<Object> userIdsList = (List<Object>) requestMap.get("userIds");
                if (userIdsList != null) {
                    for (Object userIdObj : userIdsList) {
                        if (userIdObj instanceof Number) {
                            userIds.add(((Number) userIdObj).intValue());
                        }
                    }
                }
            }

            // Validate and get all assigned users from database
            Set<ProjectMember> assignees = new HashSet<>();
            if (userIds != null && !userIds.isEmpty()) {
                for (Integer userId : userIds) {
                    ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                            userStory.getProject().getId(), userId.longValue());
                    if (projectMember != null) {
                        assignees.add(projectMember);
                    }
                }
            }
            userStory.setAssignedUsers(assignees);

            // If no specific assignees and current user is a project member, add current
            // user
            if (assignees.isEmpty() && currentUser != null) {
                ProjectMember currentUserMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                        userStory.getProject().getId(), currentUser.getId());
                if (currentUserMember != null) {
                    userStory.getAssignedUsers().add(currentUserMember);
                }
            }

            // Save the user story first
            UserStory savedUserStory = userStoryRepository.save(userStory);

            // Record activity for user story creation
            activityService.recordUserStoryActivity(
                    savedUserStory.getProject().getId(),
                    savedUserStory.getId(),
                    creatorUserId,
                    "user_story_created",
                    "User story was created");

            return ResponseEntity.ok(savedUserStory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create user story: " + e.getMessage());
        }
    }

    /**
     * Updates the status and optionally the order of a user story when dragged and
     * dropped on the Kanban board
     * 
     * @param id       The ID of the user story to update
     * @param statusId The ID of the new status
     * @param order    The optional new order/position in the column (nullable)
     * @return ResponseEntity with the updated user story
     */
    @PutMapping("/userstory/{id}/status/{statusId}")
    public ResponseEntity<?> updateUserStoryStatus(
            @PathVariable Integer id,
            @PathVariable Integer statusId,
            @RequestParam(required = false) Integer order) {

        // Find the user story
        Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
        if (!userStoryOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        UserStory userStory = userStoryOpt.get();
        Integer oldStatusId = userStory.getStatus() != null ? userStory.getStatus().getId() : null;

        // Create a new status entity with the given ID
        ProjectSettingStatus status = new ProjectSettingStatus();
        status.setId(statusId);

        // Update the status
        userStory.setStatus(status);

        // Update order if provided
        if (order != null) {
            // If implementing custom ordering logic, add it here
            // This could involve shifting other items in the same column
        }

        // Save the updated user story
        UserStory savedUserStory = userStoryRepository.save(userStory);

        // Record activity for status change
        // Default to user ID 1 if no user info is available
        Long userId = 1L;
        try {
            ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (requestAttributes != null) {
                HttpServletRequest request = requestAttributes.getRequest();
                String userIdHeader = request.getHeader("User-Id");
                if (userIdHeader != null) {
                    userId = Long.parseLong(userIdHeader);
                }
            }
        } catch (Exception e) {
            // Fallback to default if header not available or parsing fails
        }

        activityService.recordUserStoryActivity(
                savedUserStory.getProject().getId(),
                savedUserStory.getId(),
                userId,
                "status_updated",
                "Status changed from " + oldStatusId + " to " + statusId);

        return ResponseEntity.ok(savedUserStory);
    }

    @PutMapping("/userstory/{id}/status")
    public ResponseEntity<?> patchUserStoryStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> payload) {
        Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
        if (!userStoryOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        UserStory userStory = userStoryOpt.get();
        Integer oldStatusId = userStory.getStatus() != null ? userStory.getStatus().getId() : null;
        Integer statusId = payload.get("statusId");
        Integer order = payload.get("order");
        ProjectSettingStatus status = new ProjectSettingStatus();
        status.setId(statusId);
        userStory.setStatus(status);
        if (order != null) {
            // implement ordering logic if needed
        }
        UserStory saved = userStoryRepository.save(userStory);

        // Record activity for status change
        Long userId = 1L; // Default
        try {
            ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (requestAttributes != null) {
                HttpServletRequest request = requestAttributes.getRequest();
                String userIdHeader = request.getHeader("User-Id");
                if (userIdHeader != null) {
                    userId = Long.parseLong(userIdHeader);
                }
            }
        } catch (Exception e) {
            // Fallback to default
        }

        activityService.recordUserStoryActivity(
                saved.getProject().getId(),
                saved.getId(),
                userId,
                "status_updated",
                "Status changed from " + oldStatusId + " to " + statusId);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user-story/{id}")
    public ResponseEntity<UserStoryDTO> getUserStoryDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(kanbanUserStoryService.getUserStoryById(id));
    }

    @PatchMapping("/user-story/{id}")
    public ResponseEntity<UserStoryDTO> updateUserStoryDetails(
            @PathVariable Integer id,
            @RequestBody UserStoryDTO update) {
        return ResponseEntity.ok(kanbanUserStoryService.updateUserStory(id, update));
    }

    @PostMapping("/user-story/{id}/task")
    public ResponseEntity<TaskDTO> addSubTaskToUserStory(
            @PathVariable Integer id,
            @RequestBody TaskDTO subTask) {
        TaskDTO created = kanbanUserStoryService.addSubTask(id, subTask);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/user-story/{id}/comment")
    public ResponseEntity<CommentDTO> addCommentToUserStory(
            @PathVariable Integer id,
            @RequestBody CommentDTO comment) {
        CommentDTO created = kanbanUserStoryService.addComment(id, comment);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/user-story/{id}/activities")
    public ResponseEntity<List<ActivityDTO>> getUserStoryActivities(@PathVariable Integer id) {
        // Using kanbanUserStoryService.getActivities was likely a placeholder
        // Now use the actual ActivityService implementation for user story activities
        // We'll use a default user ID (1) for simplicity instead of requiring a User-Id
        // header
        // In a real app, this would be extracted from the security context
        try {
            User user = securityUtils.getCurrentUser();
            List<ActivityDTO> activities = activityService.getUserStoryActivities(id, user.getId());
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{taskId}/activities")
    public ResponseEntity<List<ActivityDTO>> getTaskActivities(@PathVariable Integer taskId) {
        try {
            User user = securityUtils.getCurrentUser();
            if (user == null) {
                return ResponseEntity.badRequest().build();
            }
            List<ActivityDTO> activities = activityService.getTaskActivities(taskId, user.getId());
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // New endpoint for user story activities - REST style
    @GetMapping("/userstory/{id}/activities")
    public ResponseEntity<List<ActivityDTO>> getUserStoryActivitiesRest(@PathVariable Integer id) {
        try {
            User user = securityUtils.getCurrentUser();
            List<ActivityDTO> activities = activityService.getUserStoryActivities(id, user.getId());
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/members")
    public ResponseEntity<List<User>> getAllMembers() {
        List<User> members = userRepository.findAll();
        return ResponseEntity.ok(members);
    }

    @GetMapping("/userstory/project/{projectId}")
    public ResponseEntity<List<UserStoryResponseDTO>> getUserStoriesByProject(@PathVariable Long projectId) {
        try {
            List<UserStory> userStories = userStoryRepository.findByProjectId(projectId);

            // Lọc bỏ các user story đã bị đánh dấu xóa (nếu vẫn còn lọt qua query
            // repository)
            userStories = userStories.stream()
                    .filter(story -> story.getIsDeleted() == null || !story.getIsDeleted())
                    .collect(Collectors.toList());

            List<UserStoryResponseDTO> responseList = userStories.stream().map(story -> {
                // Map data từ entity sang DTO
                UserStoryResponseDTO dto = new UserStoryResponseDTO();
                dto.setId(story.getId());
                dto.setName(story.getName());
                dto.setDescription(story.getDescription());

                // Nếu story có status, lấy ID của status
                if (story.getStatus() != null) {
                    dto.setStatusId(story.getStatus().getId());
                }

                // Các thông tin khác
                dto.setSwimlaneId(story.getSwimlane() != null ? story.getSwimlane().getId() : null);
                dto.setProjectId(story.getProject().getId());
                dto.setUxPoints(story.getUxPoints());
                dto.setBackPoints(story.getBackPoints());
                dto.setFrontPoints(story.getFrontPoints());
                dto.setDesignPoints(story.getDesignPoints());
                dto.setDueDate(story.getDueDate());
                dto.setIsBlocked(story.getIsBlock());

                // Thêm thông tin người tạo nếu có
                if (story.getCreatedBy() != null && story.getCreatedBy().getUser() != null) {
                    dto.setCreatedByFullName(story.getCreatedBy().getUser().getFullName());
                    dto.setCreatedByUsername(story.getCreatedBy().getUser().getUsername());
                }

                // Thêm thông tin assignedUsers
                if (story.getAssignedUsers() != null && !story.getAssignedUsers().isEmpty()) {
                    List<UserDTO> assignedUsers = story.getAssignedUsers().stream()
                            .map(member -> {
                                UserDTO userDTO = new UserDTO();
                                userDTO.setId(member.getUser().getId());
                                userDTO.setUsername(member.getUser().getUsername());
                                userDTO.setFullName(member.getUser().getFullName());
                                return userDTO;
                            })
                            .collect(Collectors.toList());
                    dto.setAssignedUsers(assignedUsers);
                }

                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ArrayList<>());
        }
    }

    @GetMapping("/userstory/{id}")
    public ResponseEntity<?> getUserStoryById(@PathVariable Integer id) {
        try {
            UserStory story = userStoryRepository.findById(id).orElse(null);
            if (story == null) {
                return ResponseEntity.notFound().build();
            }

            // Kiểm tra thêm một lần nữa nếu user story đã bị đánh dấu xóa
            if (story.getIsDeleted() != null && story.getIsDeleted()) {
                return ResponseEntity.notFound().build();
            }

            UserStoryResponseDTO dto = new UserStoryResponseDTO();
            dto.setId(story.getId());
            dto.setName(story.getName());
            dto.setDescription(story.getDescription());
            dto.setStatusId(story.getStatus().getId());
            dto.setSwimlaneId(story.getSwimlane() != null ? story.getSwimlane().getId() : null);
            dto.setProjectId(story.getProject().getId());
            dto.setUxPoints(story.getUxPoints());
            dto.setBackPoints(story.getBackPoints());
            dto.setFrontPoints(story.getFrontPoints());
            dto.setDesignPoints(story.getDesignPoints());
            dto.setDueDate(story.getDueDate());
            dto.setCreatedAt(story.getCreatedAt());
            dto.setCreatedByFullName(story.getCreatedBy().getUser().getFullName());
            dto.setCreatedByUsername(story.getCreatedBy().getUser().getUsername());
            // dto.setAssignedUserId(story.getAssignedTo() != null ?
            // story.getAssignedTo().getId() : null);

            // Set blocked state directly
            dto.setIsBlocked(story.getIsBlock());

            // Include attachments
            if (story.getAttachments() != null) {
                dto.setAttachments(story.getAttachments().stream().map(attachment -> {
                    AttachmentDTO attachmentDTO = new AttachmentDTO();
                    attachmentDTO.setId(attachment.getId());
                    attachmentDTO.setFilename(attachment.getFilename());
                    attachmentDTO.setContentType(attachment.getContentType());
                    attachmentDTO.setFileSize(attachment.getFileSize());
                    attachmentDTO.setUrl(attachment.getUrl());
                    attachmentDTO.setCreatedAt(attachment.getCreatedAt());
                    return attachmentDTO;
                }).collect(Collectors.toList()));
            }

            // Include tags
            if (story.getTags() != null && !story.getTags().isEmpty()) {
                dto.setTags(story.getTags().stream().map(tag -> {
                    UserStoryResponseDTO.TagDTO tagDTO = new UserStoryResponseDTO.TagDTO();
                    tagDTO.setId(tag.getId());
                    tagDTO.setName(tag.getName());
                    tagDTO.setColor(tag.getColor());
                    return tagDTO;
                }).collect(Collectors.toList()));
            }

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fetching user story: " + e.getMessage());
        }
    }

    @PutMapping("/userstory/{id}/position")
    public ResponseEntity<?> updateUserStoryPosition(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {
        try {
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();
            boolean statusChanged = false;
            Integer oldStatusId = userStory.getStatus() != null ? userStory.getStatus().getId() : null;
            Integer newStatusId = null;

            // Update status if provided
            if (payload.containsKey("statusId")) {
                newStatusId = (Integer) payload.get("statusId");
                ProjectSettingStatus status = new ProjectSettingStatus();
                status.setId(newStatusId);
                userStory.setStatus(status);
                statusChanged = !newStatusId.equals(oldStatusId);
            }

            // Update swimlane if provided
            if (payload.containsKey("swimlaneId")) {
                Integer swimlaneId = (Integer) payload.get("swimlaneId");
                KanbanSwimland swimlane = new KanbanSwimland();
                swimlane.setId(swimlaneId);
                userStory.setSwimlane(swimlane);
            }

            UserStory saved = userStoryRepository.save(userStory);

            // Record activity for status change if applicable
            if (statusChanged) {
                // Get user ID from payload or default to 1L
                Long userId = 1L;
                if (payload.containsKey("userId")) {
                    userId = ((Number) payload.get("userId")).longValue();
                } else {
                    try {
                        ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                                .getRequestAttributes();
                        if (requestAttributes != null) {
                            HttpServletRequest request = requestAttributes.getRequest();
                            String userIdHeader = request.getHeader("User-Id");
                            if (userIdHeader != null) {
                                userId = Long.parseLong(userIdHeader);
                            }
                        }
                    } catch (Exception e) {
                        // Fallback to default
                    }
                }

                activityService.recordUserStoryActivity(
                        saved.getProject().getId(),
                        saved.getId(),
                        userId,
                        "status_updated",
                        "Status changed from " + oldStatusId + " to " + newStatusId);
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update user story position: " + e.getMessage());
        }
    }

    @PutMapping("/userstory/{id}/duedate")
    public ResponseEntity<?> updateUserStoryDueDate(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        try {
            System.out.println("Update due date request received for story id: " + id);
            System.out.println("Payload: " + payload);

            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
            if (!userStoryOpt.isPresent()) {
                System.out.println("User story not found with id: " + id);
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();
            String oldDateStr = userStory.getDueDate() != null ? userStory.getDueDate().toString() : "none";
            String dueDateStr = payload.get("dueDate");
            System.out.println("Due date string from request: " + dueDateStr);

            if (dueDateStr != null) {
                try {
                    LocalDate dueDate = LocalDate.parse(dueDateStr);
                    userStory.setDueDate(dueDate);
                    System.out.println("Due date parsed successfully: " + dueDate);
                } catch (Exception e) {
                    System.err.println("Error parsing due date: " + e.getMessage());
                    return ResponseEntity.badRequest().body("Invalid date format. Expected yyyy-MM-dd");
                }
            } else {
                System.out.println("No due date provided in the payload");
                return ResponseEntity.badRequest().body("No due date provided");
            }

            UserStory saved = userStoryRepository.save(userStory);
            System.out.println("User story saved with due date: " + saved.getDueDate());

            // Record activity for due date change
            Long userId = 1L; // Default
            try {
                ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                        .getRequestAttributes();
                if (requestAttributes != null) {
                    HttpServletRequest request = requestAttributes.getRequest();
                    String userIdHeader = request.getHeader("User-Id");
                    if (userIdHeader != null) {
                        userId = Long.parseLong(userIdHeader);
                    }
                }
            } catch (Exception e) {
                // Fallback to default
            }

            activityService.recordUserStoryActivity(
                    saved.getProject().getId(),
                    saved.getId(),
                    userId,
                    "due_date_updated",
                    "Due date changed from " + oldDateStr + " to " + dueDateStr);

            // Return updated user story
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("Error updating due date: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to update due date: " + e.getMessage());
        }
    }

    @PostMapping("/userstory/{id}/assign")
    public ResponseEntity<?> assignUserToStory(
            @PathVariable Long id,
            @RequestBody Map<String, Long> payload) {
        try {
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id.intValue());
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();
            Long userId = payload.get("userId");

            if (userId != null) {
                // Check if user is a member of the project
                ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                        userStory.getProject().getId(), userId);

                if (projectMember == null) {
                    return ResponseEntity.badRequest().body("User is not a member of this project");
                }

                // Check if user is already assigned
                boolean isAlreadyAssigned = userStory.getAssignedUsers().stream()
                        .anyMatch(member -> member.getUser().getId().equals(userId));

                if (isAlreadyAssigned) {
                    return ResponseEntity.badRequest().body("User is already assigned to this story");
                }

                // Add project member to assigned users
                userStory.getAssignedUsers().add(projectMember);
                userStoryRepository.save(userStory);

                // Record activity for user assignment
                Long actorUserId = payload.getOrDefault("actorUserId", userId);
                String action = "user_assigned";
                String details = "User " + projectMember.getUser().getUsername() + " assigned to user story";

                // Create notification for the assigned user
                createAssigneeNotification(projectMember.getUser(), userStory, actorUserId);

                activityService.recordUserStoryActivity(
                        userStory.getProject().getId(),
                        userStory.getId(),
                        actorUserId,
                        action,
                        details);
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to assign user: " + e.getMessage());
        }
    }

    @DeleteMapping("/userstory/{id}/assign/{userId}")
    public ResponseEntity<?> removeUserFromStory(
            @PathVariable Long id,
            @PathVariable Long userId) {
        try {
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id.intValue());
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();

            // Find the project member to remove
            ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                    userStory.getProject().getId(), userId);
            if (projectMember == null) {
                return ResponseEntity.badRequest().body("User is not a member of this project");
            }

            boolean wasRemoved = userStory.getAssignedUsers()
                    .removeIf(member -> member.getId().equals(projectMember.getId()));
            userStoryRepository.save(userStory);

            if (wasRemoved) {
                // Get the actor user ID from request header or default to a system user ID
                Long actorUserId = 1L; // Default system user ID
                try {
                    ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                            .getRequestAttributes();
                    if (requestAttributes != null) {
                        HttpServletRequest request = requestAttributes.getRequest();
                        String actorUserIdHeader = request.getHeader("User-Id");
                        if (actorUserIdHeader != null) {
                            actorUserId = Long.parseLong(actorUserIdHeader);
                        }
                    }
                } catch (Exception e) {
                    // Fallback to default if header not available or parsing fails
                }

                // Record activity for user removal
                String action = "user_unassigned";
                String details = "User " + projectMember.getUser().getUsername() + " removed from user story";

                activityService.recordUserStoryActivity(
                        userStory.getProject().getId(),
                        userStory.getId(),
                        actorUserId,
                        action,
                        details);
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to remove user: " + e.getMessage());
        }
    }

    @GetMapping("/userstory/{id}/assigned-users")
    public ResponseEntity<?> getAssignedUsers(@PathVariable Long id) {
        try {
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id.intValue());
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();
            List<UserDTO> assignedUsers = userStory.getAssignedUsers().stream()
                    .map(member -> {
                        User user = member.getUser();
                        UserDTO dto = new UserDTO();
                        dto.setId(user.getId().longValue());
                        dto.setUsername(user.getUsername());
                        dto.setFullName(user.getFullName());
                        UserSettings userSettings = userSettingsRepository.findByUser(user).orElse(null);
                        dto.setPhotoUrl(userSettings != null ? userSettings.getPhotoUrl() : null);
                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(assignedUsers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get assigned users: " + e.getMessage());
        }
    }

    @GetMapping("/userstory/{id}/available-assignees")
    public ResponseEntity<List<UserDTO>> getAvailableAssignees(@PathVariable Integer id) {
        try {
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();
            List<ProjectMember> projectMembers = projectMemberRepository.findByProjectIdAndIsDeleteFalse(
                    userStory.getProject().getId());

            List<UserDTO> availableAssignees = projectMembers.stream()
                    .map(member -> {
                        UserDTO dto = new UserDTO();
                        dto.setId(member.getUser().getId().longValue());
                        dto.setUsername(member.getUser().getUsername());
                        dto.setFullName(member.getUser().getFullName());
                        UserSettings userSettings = userSettingsRepository.findByUser(member.getUser()).orElse(null);
                        dto.setPhotoUrl(userSettings != null ? userSettings.getPhotoUrl() : null);
                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(availableAssignees);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/userstory/{id}")
    public ResponseEntity<?> updateUserStory(
            @PathVariable Integer id,
            @RequestBody UserStoryResponseDTO updateRequest) {
        try {
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();

            // Store original values for activity recording
            String originalName = userStory.getName();
            String originalDescription = userStory.getDescription();
            Integer originalUxPoints = userStory.getUxPoints();
            Integer originalBackPoints = userStory.getBackPoints();
            Integer originalFrontPoints = userStory.getFrontPoints();
            Integer originalDesignPoints = userStory.getDesignPoints();
            Integer originalStatusId = userStory.getStatus() != null ? userStory.getStatus().getId() : null;
            Integer originalSwimlaneId = userStory.getSwimlane() != null ? userStory.getSwimlane().getId() : null;

            // Update basic fields
            if (updateRequest.getName() != null) {
                userStory.setName(updateRequest.getName());
            }
            if (updateRequest.getDescription() != null) {
                userStory.setDescription(updateRequest.getDescription());
            }

            // Update points
            if (updateRequest.getUxPoints() != null) {
                userStory.setUxPoints(updateRequest.getUxPoints());
            }
            if (updateRequest.getBackPoints() != null) {
                userStory.setBackPoints(updateRequest.getBackPoints());
            }
            if (updateRequest.getFrontPoints() != null) {
                userStory.setFrontPoints(updateRequest.getFrontPoints());
            }
            if (updateRequest.getDesignPoints() != null) {
                userStory.setDesignPoints(updateRequest.getDesignPoints());
            }

            // Update status if provided
            if (updateRequest.getStatusId() != null) {
                ProjectSettingStatus status = new ProjectSettingStatus();
                status.setId(updateRequest.getStatusId());
                userStory.setStatus(status);
            }

            // Update swimlane if provided
            if (updateRequest.getSwimlaneId() != null) {
                KanbanSwimland swimlane = new KanbanSwimland();
                swimlane.setId(updateRequest.getSwimlaneId());
                userStory.setSwimlane(swimlane);
            }

            // Update due date if provided
            if (updateRequest.getDueDate() != null) {
                userStory.setDueDate(updateRequest.getDueDate());
            }

            UserStory savedUserStory = userStoryRepository.save(userStory);

            // Get user ID from request header or default to 1L
            Long userId = 1L;
            try {
                ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                        .getRequestAttributes();
                if (requestAttributes != null) {
                    HttpServletRequest request = requestAttributes.getRequest();
                    String userIdHeader = request.getHeader("User-Id");
                    if (userIdHeader != null) {
                        userId = Long.parseLong(userIdHeader);
                    }
                }
            } catch (Exception e) {
                // Fallback to default
            }

            // Record activities for changes
            // Name change
            if (updateRequest.getName() != null && !updateRequest.getName().equals(originalName)) {
                activityService.recordUserStoryActivity(
                        savedUserStory.getProject().getId(),
                        savedUserStory.getId(),
                        userId,
                        "name_updated",
                        "Name changed from \"" + originalName + "\" to \"" + updateRequest.getName() + "\"");
            }

            // Description change
            if (updateRequest.getDescription() != null && !updateRequest.getDescription().equals(originalDescription)) {
                activityService.recordUserStoryActivity(
                        savedUserStory.getProject().getId(),
                        savedUserStory.getId(),
                        userId,
                        "description_updated",
                        "Description updated");
            }

            // Points change
            boolean pointsChanged = (updateRequest.getUxPoints() != null
                    && !updateRequest.getUxPoints().equals(originalUxPoints)) ||
                    (updateRequest.getBackPoints() != null && !updateRequest.getBackPoints().equals(originalBackPoints))
                    ||
                    (updateRequest.getFrontPoints() != null
                            && !updateRequest.getFrontPoints().equals(originalFrontPoints))
                    ||
                    (updateRequest.getDesignPoints() != null
                            && !updateRequest.getDesignPoints().equals(originalDesignPoints));

            if (pointsChanged) {
                int oldTotal = (originalUxPoints != null ? originalUxPoints : 0) +
                        (originalBackPoints != null ? originalBackPoints : 0) +
                        (originalFrontPoints != null ? originalFrontPoints : 0) +
                        (originalDesignPoints != null ? originalDesignPoints : 0);

                int newTotal = (savedUserStory.getUxPoints() != null ? savedUserStory.getUxPoints() : 0) +
                        (savedUserStory.getBackPoints() != null ? savedUserStory.getBackPoints() : 0) +
                        (savedUserStory.getFrontPoints() != null ? savedUserStory.getFrontPoints() : 0) +
                        (savedUserStory.getDesignPoints() != null ? savedUserStory.getDesignPoints() : 0);

                activityService.recordUserStoryActivity(
                        savedUserStory.getProject().getId(),
                        savedUserStory.getId(),
                        userId,
                        "points_updated",
                        "Points updated from " + oldTotal + " to " + newTotal);
            }

            // Status change
            if (updateRequest.getStatusId() != null && !updateRequest.getStatusId().equals(originalStatusId)) {
                activityService.recordUserStoryActivity(
                        savedUserStory.getProject().getId(),
                        savedUserStory.getId(),
                        userId,
                        "status_updated",
                        "Status changed from " + originalStatusId + " to " + updateRequest.getStatusId());
            }

            // Swimlane change
            if (updateRequest.getSwimlaneId() != null && !updateRequest.getSwimlaneId().equals(originalSwimlaneId)) {
                activityService.recordUserStoryActivity(
                        savedUserStory.getProject().getId(),
                        savedUserStory.getId(),
                        userId,
                        "swimlane_updated",
                        "Swimlane changed from " + originalSwimlaneId + " to " + updateRequest.getSwimlaneId());
            }

            // Create response DTO with direct field access instead of using setters
            UserStoryResponseDTO responseDTO = new UserStoryResponseDTO();
            responseDTO.setId(savedUserStory.getId());
            responseDTO.setName(savedUserStory.getName());
            responseDTO.setDescription(savedUserStory.getDescription());

            // Use direct field access for isBlocked through reflection
            try {
                java.lang.reflect.Field field = responseDTO.getClass().getDeclaredField("isBlocked");
                field.setAccessible(true);
                field.set(responseDTO, savedUserStory.getIsBlock());
            } catch (Exception e) {
                // Fallback if reflection fails
                System.err.println("Failed to set isBlocked field: " + e.getMessage());
            }

            if (savedUserStory.getStatus() != null) {
                responseDTO.setStatusId(savedUserStory.getStatus().getId());
            }
            if (savedUserStory.getSwimlane() != null) {
                responseDTO.setSwimlaneId(savedUserStory.getSwimlane().getId());
            }
            if (savedUserStory.getProject() != null) {
                responseDTO.setProjectId(savedUserStory.getProject().getId());
            }

            responseDTO.setUxPoints(savedUserStory.getUxPoints());
            responseDTO.setBackPoints(savedUserStory.getBackPoints());
            responseDTO.setFrontPoints(savedUserStory.getFrontPoints());
            responseDTO.setDesignPoints(savedUserStory.getDesignPoints());
            responseDTO.setDueDate(savedUserStory.getDueDate());
            responseDTO.setCreatedAt(savedUserStory.getCreatedAt());
            if (savedUserStory.getCreatedBy() != null) {
                responseDTO.setCreatedByFullName(savedUserStory.getCreatedBy().getUser().getFullName());
                responseDTO.setCreatedByUsername(savedUserStory.getCreatedBy().getUser().getUsername());
            }
            // if (savedUserStory.getAssignedTo() != null) {
            // responseDTO.setAssignedUserId(savedUserStory.getAssignedTo().getId());
            // }

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update user story: " + e.getMessage());
        }
    }

    @PutMapping("/userstory/{id}/block")
    public ResponseEntity<?> toggleUserStoryBlockStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> payload) {
        try {
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();
            Boolean isBlocked = payload.get("isBlocked");
            Boolean oldBlockState = userStory.getIsBlock();

            if (isBlocked != null) {
                userStory.setIsBlock(isBlocked);
            }

            UserStory saved = userStoryRepository.save(userStory);

            // Record activity for block status change
            Long userId = 1L; // Default
            try {
                ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                        .getRequestAttributes();
                if (requestAttributes != null) {
                    HttpServletRequest request = requestAttributes.getRequest();
                    String userIdHeader = request.getHeader("User-Id");
                    if (userIdHeader != null) {
                        userId = Long.parseLong(userIdHeader);
                    }
                }
            } catch (Exception e) {
                // Fallback to default
            }

            if (isBlocked != null && !isBlocked.equals(oldBlockState)) {
                activityService.recordUserStoryActivity(
                        saved.getProject().getId(),
                        saved.getId(),
                        userId,
                        "block_status_updated",
                        isBlocked ? "User story blocked" : "User story unblocked");
            }

            // Use our custom response class to avoid DTO issues
            UserStoryBlockResponse response = new UserStoryBlockResponse(saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update block status: " + e.getMessage());
        }
    }

    @DeleteMapping("/userstory/{id}")
    public ResponseEntity<?> deleteUserStory(@PathVariable Integer id) {
        try {
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();

            // Get user ID for activity recording
            Long userId = 1L; // Default
            try {
                ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                        .getRequestAttributes();
                if (requestAttributes != null) {
                    HttpServletRequest request = requestAttributes.getRequest();
                    String userIdHeader = request.getHeader("User-Id");
                    if (userIdHeader != null) {
                        userId = Long.parseLong(userIdHeader);
                    }
                }
            } catch (Exception e) {
                // Fallback to default
            }

            // Record activity before soft deletion
            activityService.recordUserStoryActivity(
                    userStory.getProject().getId(),
                    userStory.getId(),
                    userId,
                    "user_story_deleted",
                    "User story \"" + userStory.getName() + "\" was deleted");

            // Perform soft delete
            userStory.setIsDeleted(true);
            userStoryRepository.save(userStory);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete user story: " + e.getMessage());
        }
    }

    @GetMapping("/userstory/{id}/watchers")
    public ResponseEntity<List<UserDTO>> getWatchers(@PathVariable Integer id) {
        try {
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();
            List<UserDTO> watchers = userStory.getWatchers().stream()
                    .map(member -> {
                        User user = member.getUser();
                        UserDTO dto = new UserDTO();
                        dto.setId(user.getId().longValue());
                        dto.setUsername(user.getUsername());
                        dto.setFullName(user.getFullName());
                        UserSettings userSettings = userSettingsRepository.findByUser(user).orElse(null);
                        dto.setPhotoUrl(userSettings != null ? userSettings.getPhotoUrl() : null);
                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(watchers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/userstory/{id}/watchers")
    public ResponseEntity<?> addWatcherToUserStory(
            @PathVariable Integer id,
            @RequestBody Map<String, Long> payload) {
        try {
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();
            Long watcherId = payload.get("userId");

            if (watcherId != null) {
                // Check if user is already watching
                boolean isAlreadyWatching = userStory.getWatchers().stream()
                        .anyMatch(user -> user.getId().equals(watcherId));

                if (isAlreadyWatching) {
                    return ResponseEntity.badRequest().body("User is already watching this story");
                }

                // Get existing user from repository
                Optional<User> userOpt = userRepository.findById(watcherId);
                if (!userOpt.isPresent()) {
                    return ResponseEntity.badRequest().body("User not found");
                }

                ProjectMember watcher = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                        userStory.getProject().getId(), watcherId);

                // Add user to watchers
                userStory.getWatchers().add(watcher);
                userStoryRepository.save(userStory);

                // Record activity for adding watcher
                Long userId = 1L; // Default actor
                try {
                    ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                            .getRequestAttributes();
                    if (requestAttributes != null) {
                        HttpServletRequest request = requestAttributes.getRequest();
                        String userIdHeader = request.getHeader("User-Id");
                        if (userIdHeader != null) {
                            userId = Long.parseLong(userIdHeader);
                        }
                    }
                } catch (Exception e) {
                    // Fallback to default
                }

                // Create notification for the watcher
                createWatcherNotification(watcher.getUser(), userStory, userId);

                activityService.recordUserStoryActivity(
                        userStory.getProject().getId(),
                        userStory.getId(),
                        userId,
                        "watcher_added",
                        "User " + watcher.getUser().getUsername() + " started watching this story");
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to add watcher: " + e.getMessage());
        }
    }

    @DeleteMapping("/userstory/{id}/watchers/{userId}")
    public ResponseEntity<?> removeWatcherFromUserStory(
            @PathVariable Integer id,
            @PathVariable Long userId) {
        try {
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();

            // Find user before removing to get username for activity
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            User watcher = userOpt.get();
            String username = watcher.getUsername();
            ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                    userStory.getProject().getId(), userId.longValue());
            if (projectMember == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User is not a watcher of this task or not a project member");
            }

            userStory.getWatchers().remove(projectMember);
            userStoryRepository.save(userStory);

            // Record activity for removing watcher
            Long actorUserId = userStory.getCreatedBy().getUser().getId();
            try {
                ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                        .getRequestAttributes();
                if (requestAttributes != null) {
                    HttpServletRequest request = requestAttributes.getRequest();
                    String userIdHeader = request.getHeader("User-Id");
                    if (userIdHeader != null) {
                        actorUserId = Long.parseLong(userIdHeader);
                    }
                }
            } catch (Exception e) {
                // Fallback to default
            }

            activityService.recordUserStoryActivity(
                    userStory.getProject().getId(),
                    userStory.getId(),
                    actorUserId,
                    "watcher_removed",
                    "User " + username + " stopped watching this story");

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to remove watcher: " + e.getMessage());
        }
    }

    @GetMapping("/userstory/{id}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Integer id) {
        try {
            // Find user story
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();

            // Get comments
            List<Comment> comments = commentRepository.findByUserStoryOrderByCreatedAtDesc(userStory);

            // Convert to DTOs
            List<CommentDTO> commentDTOs = comments.stream()
                    .map(comment -> {
                        CommentDTO dto = new CommentDTO();
                        dto.setId(comment.getId());
                        dto.setContent(comment.getContent());
                        dto.setCreatedAt(comment.getCreatedAt());
                        dto.setUserId(comment.getUser().getId());
                        dto.setUserFullName(comment.getUser().getFullName());
                        dto.setUsername(comment.getUser().getUsername());
                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(commentDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/userstory/{id}/comments")
    public ResponseEntity<List<CommentDTO>> addComment(
            @PathVariable Integer id,
            @RequestBody AddCommentRequest request) {
        try {
            // Find user story
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();

            // Get user ID from request header or default to 1L
            User user = securityUtils.getCurrentUser();
            Long userId = user.getId();

            // Find user
            Optional<User> userOptional = userRepository.findById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().build();
            }

            // Create and add comment
            Comment comment = new Comment();
            comment.setContent(request.getContent());
            comment.setUserStory(userStory);
            comment.setUser(userOptional.get());
            comment.setCreatedAt(LocalDateTime.now());
            comment.setUpdatedAt(LocalDateTime.now());

            // Save comment
            comment = commentRepository.save(comment);

            // Get updated comments list
            List<Comment> comments = commentRepository.findByUserStoryOrderByCreatedAtDesc(userStory);

            // Convert to DTOs
            List<CommentDTO> commentDTOs = comments.stream()
                    .map(c -> {
                        CommentDTO dto = new CommentDTO();
                        dto.setId(c.getId());
                        dto.setContent(c.getContent());
                        dto.setCreatedAt(c.getCreatedAt());
                        dto.setUserId(c.getUser().getId());
                        dto.setUserFullName(c.getUser().getFullName());
                        dto.setUsername(c.getUser().getUsername());
                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(commentDTOs);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error for debugging
            return ResponseEntity.badRequest().build();
        }
    }

    // Request class for adding comments
    public static class AddCommentRequest {
        private String content;
        private Integer userId;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public Integer getUserId() {
            return userId;
        }

        public void setUserId(Integer userId) {
            this.userId = userId;
        }
    }

    // Request class for creating user story with assignees
    public static class CreateUserStoryRequest {
        private UserStory userStory;
        private List<Integer> userIds;

        public UserStory getUserStory() {
            return userStory;
        }

        public void setUserStory(UserStory userStory) {
            this.userStory = userStory;
        }

        public List<Integer> getUserIds() {
            return userIds;
        }

        public void setUserIds(List<Integer> userIds) {
            this.userIds = userIds;
        }
    }

    @PostMapping("/{taskId}/attachment")
    public ResponseEntity<?> addAttachmentToTask(
            @PathVariable("taskId") Integer taskId,
            @RequestBody AttachmentDTO attachmentDTO) {
        try {
            // Determine current user: prefer header, fallback to security context
            User currentUser = securityUtils.getCurrentUser();
            Long userId = currentUser.getId();
            if (userId != null) {
                currentUser = userRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));
            } else {
                currentUser = securityUtils.getCurrentUser();
            }

            // Create a new attachment
            Attachment attachment = new Attachment();
            attachment.setFilename(attachmentDTO.getFilename());
            attachment.setContentType(attachmentDTO.getContentType());
            attachment.setFileSize(attachmentDTO.getFileSize());
            attachment.setUrl(attachmentDTO.getUrl());
            attachment.setIsDelete(false);
            attachment.setCreatedAt(LocalDateTime.now());
            attachment.setCreatedBy(currentUser);

            // Save the attachment
            Attachment savedAttachment = attachmentRepository.save(attachment);

            // Find the task
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

            // Add attachment to the task using taskAttachments instead of attachments
            if (task.getTaskAttachments() == null) {
                task.setTaskAttachments(new ArrayList<>());
            }
            TaskAttachment taskAttachment = new TaskAttachment();
            taskAttachment.setTask(task);
            taskAttachment.setAttachment(savedAttachment);
            taskAttachmentRepository.save(taskAttachment);

            // No need to explicitly add to task's collection as it will be managed by
            // Hibernate
            taskRepository.save(task);

            // Record activity
            String activityDetail = String.format("Attachment '%s' added", savedAttachment.getFilename());
            activityService.recordTaskActivity(
                    task.getProject().getId(),
                    task.getId(),
                    currentUser.getId(),
                    "attachment_added",
                    activityDetail);

            // Convert saved attachment to DTO for response
            AttachmentDTO savedAttachmentDTO = new AttachmentDTO();
            savedAttachmentDTO.setId(savedAttachment.getId());
            savedAttachmentDTO.setFilename(savedAttachment.getFilename());
            savedAttachmentDTO.setContentType(savedAttachment.getContentType());
            savedAttachmentDTO.setFileSize(savedAttachment.getFileSize());
            savedAttachmentDTO.setUrl(savedAttachment.getUrl());
            savedAttachmentDTO.setCreatedAt(savedAttachment.getCreatedAt());

            // Return the saved attachment in the response
            return ResponseEntity.ok(savedAttachmentDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add attachment: " + e.getMessage());
        }
    }

    @PostMapping("/userstory/{userStoryId}/attachment")
    public ResponseEntity<?> addAttachment(
            @PathVariable("userStoryId") Integer userStoryId,
            @RequestBody AttachmentDTO attachmentDTO) {
        try {
            // Get the current authenticated user
            User currentUser = securityUtils.getCurrentUser();

            // Find the user story
            UserStory userStory = userStoryRepository.findById(userStoryId)
                    .orElseThrow(() -> new IllegalArgumentException("User story not found with ID: " + userStoryId));

            // Create a new attachment
            Attachment attachment = new Attachment();
            attachment.setFilename(attachmentDTO.getFilename());
            attachment.setContentType(attachmentDTO.getContentType());
            attachment.setFileSize(attachmentDTO.getFileSize());
            attachment.setUrl(attachmentDTO.getUrl());
            attachment.setIsDelete(false);
            attachment.setCreatedAt(LocalDateTime.now());
            attachment.setCreatedBy(currentUser);

            // Save the attachment
            Attachment savedAttachment = attachmentRepository.save(attachment);

            // Add attachment to the user story
            if (userStory.getAttachments() == null) {
                userStory.setAttachments(new HashSet<>());
            }
            userStory.getAttachments().add(savedAttachment);
            userStoryRepository.save(userStory);

            // Record activity
            String activityDetail = String.format("Attachment '%s' added", savedAttachment.getFilename());
            activityService.recordUserStoryActivity(
                    userStory.getProject().getId(),
                    userStory.getId(),
                    currentUser.getId(),
                    "attachment_added",
                    activityDetail);

            // Convert saved attachment to DTO for response
            AttachmentDTO savedAttachmentDTO = new AttachmentDTO();
            savedAttachmentDTO.setId(savedAttachment.getId());
            savedAttachmentDTO.setFilename(savedAttachment.getFilename());
            savedAttachmentDTO.setContentType(savedAttachment.getContentType());
            savedAttachmentDTO.setFileSize(savedAttachment.getFileSize());
            savedAttachmentDTO.setUrl(savedAttachment.getUrl());
            savedAttachmentDTO.setCreatedAt(savedAttachment.getCreatedAt());

            // Return the saved attachment in the response
            return ResponseEntity.ok(savedAttachmentDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add attachment: " + e.getMessage());
        }
    }

    @DeleteMapping("/userstory/{userStoryId}/attachment/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(
            @PathVariable("userStoryId") Integer userStoryId,
            @PathVariable("attachmentId") Long attachmentId) {
        try {
            // Get the current authenticated user
            User currentUser = securityUtils.getCurrentUser();

            // Find the user story
            UserStory userStory = userStoryRepository.findById(userStoryId)
                    .orElseThrow(() -> new IllegalArgumentException("User Story not found with ID: " + userStoryId));

            // Find the attachment
            Attachment attachment = attachmentRepository.findById(attachmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Attachment not found with ID: " + attachmentId));

            // Check if the attachment belongs to the user story
            boolean attachmentBelongsToUserStory = userStory.getAttachments() != null &&
                    userStory.getAttachments().stream().anyMatch(a -> a.getId().equals(attachmentId));

            if (!attachmentBelongsToUserStory) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Attachment does not belong to this user story");
            }

            // Remove the attachment from the user story's attachments list
            userStory.getAttachments().removeIf(a -> a.getId().equals(attachmentId));

            // Save the updated user story
            userStoryRepository.save(userStory);

            // Mark the attachment as deleted but don't actually delete it from the database
            attachment.setIsDelete(true);
            attachmentRepository.save(attachment);

            // Record activity
            String activityDetail = String.format("Attachment '%s' deleted", attachment.getFilename());
            activityService.recordUserStoryActivity(
                    userStory.getProject().getId(),
                    userStory.getId(),
                    currentUser.getId(),
                    "attachment_deleted",
                    activityDetail);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete attachment: " + e.getMessage());
        }
    }

    @DeleteMapping("/{taskId}/attachment/{attachmentId}")
    public ResponseEntity<?> deleteTaskAttachment(
            @PathVariable("taskId") Integer taskId,
            @PathVariable("attachmentId") Long attachmentId) {
        try {
            // Get the current authenticated user
            User currentUser = securityUtils.getCurrentUser();

            // Find the task
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

            // Find the attachment
            Attachment attachment = attachmentRepository.findById(attachmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Attachment not found with ID: " + attachmentId));

            // Check if the attachment belongs to the task via TaskAttachment relation
            boolean attachmentFound = false;
            if (task.getTaskAttachments() != null) {
                for (TaskAttachment ta : task.getTaskAttachments()) {
                    if (ta.getAttachment().getId().equals(attachmentId)) {
                        // Remove the task attachment relationship
                        taskAttachmentRepository.delete(ta);
                        attachmentFound = true;
                        break;
                    }
                }
            }

            if (!attachmentFound) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Attachment does not belong to this task");
            }

            // Mark the attachment as deleted
            attachment.setIsDelete(true);
            attachmentRepository.save(attachment);

            // Record activity
            String activityDetail = String.format("Attachment '%s' deleted", attachment.getFilename());
            activityService.recordUserStoryActivity(
                    task.getProject().getId(),
                    task.getId(),
                    currentUser.getId(),
                    "attachment_deleted",
                    activityDetail);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete attachment: " + e.getMessage());
        }
    }

    /**
     * Calculate the progress of a sprint based on tasks completion status
     * 
     * @param sprintId ID of the sprint
     * @return ResponseEntity with progress percentage and task counts
     */
    @GetMapping("/sprint/{sprintId}/progress")
    public ResponseEntity<?> getSprintProgress(@PathVariable Long sprintId) {
        try {
            System.out.println("Getting progress for sprint ID: " + sprintId);

            // Find all tasks associated with user stories in this sprint
            List<Task> tasks = taskRepository.findTasksBySprintId(sprintId);
            System.out.println("Found " + tasks.size() + " tasks for sprint ID: " + sprintId);

            for (Task task : tasks) {
                System.out.println("Task ID: " + task.getId() +
                        ", Name: " + task.getName() +
                        ", Status ID: " + (task.getStatus() != null ? task.getStatus().getId() : "null") +
                        ", Status Name: " + (task.getStatus() != null ? task.getStatus().getName() : "null") +
                        ", Is Closed: " + (task.getStatus() != null ? task.getStatus().getClosed() : "null"));
            }

            if (tasks.isEmpty()) {
                Map<String, Object> emptyResponse = new HashMap<>();
                emptyResponse.put("percentage", 0);
                emptyResponse.put("totalTasks", 0);
                emptyResponse.put("completedTasks", 0);
                System.out.println("No tasks found for sprint ID: " + sprintId + ", returning zeros");
                return ResponseEntity.ok(emptyResponse);
            }

            // Count completed tasks (status.closed = true hoặc status.id trong danh sách
            // các status ID đánh dấu hoàn thành)
            // Từ giao diện, ta thấy cột DONE là ID 5
            Set<Integer> doneStatusIds = new HashSet<>(Arrays.asList(5)); // Thêm các ID khác nếu cần

            System.out.println("Danh sách các status ID được coi là đã hoàn thành: " + doneStatusIds);

            // Debug các task được coi là hoàn thành
            List<Task> completedTasksList = tasks.stream()
                    .filter(task -> task.getStatus() != null &&
                            (task.getStatus().getClosed() != null && task.getStatus().getClosed()
                                    || doneStatusIds.contains(task.getStatus().getId())
                                    || (task.getStatus().getName() != null &&
                                            task.getStatus().getName().toUpperCase().equals("DONE"))))
                    .collect(Collectors.toList());

            System.out.println("Số task được coi là hoàn thành: " + completedTasksList.size());
            for (Task task : completedTasksList) {
                System.out.println("Completed Task: " + task.getId() + " - " + task.getName() +
                        ", Status ID: " + (task.getStatus().getId()) +
                        ", Status Name: " + (task.getStatus().getName()));
            }

            long completedTasks = completedTasksList.size();

            // Calculate percentage - đơn giản chỉ là số task hoàn thành / tổng số task
            double percentage = ((double) completedTasks / tasks.size()) * 100;
            System.out.println(
                    "Tính toán phần trăm: " + completedTasks + " / " + tasks.size() + " * 100 = " + percentage);

            // Round the percentage
            long roundedPercentage = Math.round(percentage);
            System.out.println("Phần trăm sau khi làm tròn: " + roundedPercentage + "%");

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("percentage", roundedPercentage);
            response.put("totalTasks", tasks.size());
            response.put("completedTasks", completedTasks);

            // Thêm thông tin về status để dễ debug
            if (tasks.size() > 0) {
                List<Map<String, Object>> taskStatusInfo = tasks.stream()
                        .map(task -> {
                            Map<String, Object> info = new HashMap<>();
                            info.put("id", task.getId());
                            info.put("name", task.getName());
                            if (task.getStatus() != null) {
                                info.put("statusId", task.getStatus().getId());
                                info.put("statusName", task.getStatus().getName());
                                info.put("isClosed", task.getStatus().getClosed());
                            }
                            return info;
                        })
                        .collect(Collectors.toList());
                response.put("taskDetails", taskStatusInfo);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to calculate sprint progress: " + e.getMessage());
        }
    }

    /**
     * Add a tag to a user story
     * 
     * @param userStoryId ID of the user story
     * @param tagId       ID of the tag to add
     * @return Response entity with success or error message
     */
    @PostMapping("/userstory/{userStoryId}/tags/{tagId}")
    public ResponseEntity<?> addTagToUserStory(
            @PathVariable Integer userStoryId,
            @PathVariable Long tagId) {
        try {
            User user = securityUtils.getCurrentUser();
            Long userId = user.getId();

            UserStory userStory = userStoryRepository.findById(userStoryId)
                    .orElseThrow(() -> new RuntimeException("User story not found"));

            ProjectSettingTag tag = projectSettingTagRepository.findById(tagId)
                    .orElseThrow(() -> new RuntimeException("Tag not found"));

            // Check if the tag belongs to the same project as the user story
            if (!tag.getProject().getId().equals(userStory.getProject().getId())) {
                return ResponseEntity.badRequest().body("Tag does not belong to the same project");
            }

            // Check if the user story already has this tag
            if (userStory.getTags().contains(tag)) {
                return ResponseEntity.badRequest().body("User story already has this tag");
            }

            // Add tag to user story
            userStory.getTags().add(tag);
            userStoryRepository.save(userStory);

            // Try to record activity safely, only if we have a valid user ID
            try {
                // If no userId provided in header, try to get from security context
                Long effectiveUserId = userId;
                if (effectiveUserId == null) {
                    // Try to get from security context using securityUtils if available
                    if (securityUtils != null) {
                        try {
                            effectiveUserId = securityUtils.getCurrentUserId();
                        } catch (Exception e) {
                            // Ignore and use default
                        }
                    }

                    // If still null, use default (creator ID or 1)
                    if (effectiveUserId == null) {
                        // Use the user story creator ID if available
                        if (userStory.getCreatedBy() != null && userStory.getCreatedBy().getUser() != null) {
                            effectiveUserId = userStory.getCreatedBy().getUser().getId();
                        } else {
                            // Fall back to system user (1)
                            effectiveUserId = 1L;
                        }
                    }
                }

                // Record activity with the effective user ID
                activityService.recordUserStoryActivity(
                        userStory.getProject().getId(),
                        userStory.getId(),
                        effectiveUserId,
                        "tag_added",
                        "Added tag '" + tag.getName() + "' to user story");
            } catch (Exception e) {
                // Log but don't fail the transaction just because activity recording failed
                System.err.println("Failed to record tag add activity: " + e.getMessage());
            }

            return ResponseEntity.ok().body("Tag added successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }

    /**
     * Remove a tag from a user story
     * 
     * @param userStoryId ID of the user story
     * @param tagId       ID of the tag to remove
     * @return Response entity with success or error message
     */
    @DeleteMapping("/userstory/{userStoryId}/tags/{tagId}")
    public ResponseEntity<?> removeTagFromUserStory(
            @PathVariable Integer userStoryId,
            @PathVariable Long tagId) {
        try {
            User user = securityUtils.getCurrentUser();
            Long userId = user.getId();

            UserStory userStory = userStoryRepository.findById(userStoryId)
                    .orElseThrow(() -> new RuntimeException("User story not found"));

            ProjectSettingTag tag = projectSettingTagRepository.findById(tagId)
                    .orElseThrow(() -> new RuntimeException("Tag not found"));

            // Check if the user story has this tag
            if (!userStory.getTags().contains(tag)) {
                return ResponseEntity.badRequest().body("User story does not have this tag");
            }

            // Remove tag from user story
            userStory.getTags().remove(tag);
            userStoryRepository.save(userStory);

            // Try to record activity safely, only if we have a valid user ID
            try {
                // If no userId provided in header, try to get from security context
                Long effectiveUserId = userId;
                if (effectiveUserId == null) {
                    // Try to get from security context using securityUtils if available
                    if (securityUtils != null) {
                        try {
                            effectiveUserId = securityUtils.getCurrentUserId();
                        } catch (Exception e) {
                            // Ignore and use default
                        }
                    }

                    // If still null, use default (creator ID or 1)
                    if (effectiveUserId == null) {
                        // Use the user story creator ID if available
                        if (userStory.getCreatedBy() != null && userStory.getCreatedBy().getUser() != null) {
                            effectiveUserId = userStory.getCreatedBy().getUser().getId();
                        } else {
                            // Fall back to system user (1)
                            effectiveUserId = 1L;
                        }
                    }
                }

                // Record activity with the effective user ID
                activityService.recordUserStoryActivity(
                        userStory.getProject().getId(),
                        userStory.getId(),
                        effectiveUserId,
                        "tag_removed",
                        "Removed tag '" + tag.getName() + "' from user story");
            } catch (Exception e) {
                // Log but don't fail the transaction just because activity recording failed
                System.err.println("Failed to record tag removal activity: " + e.getMessage());
            }

            return ResponseEntity.ok().body("Tag removed successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }

    /**
     * Create a notification for the assignee of a user story
     * 
     * @param receiver  The user to receive the notification
     * @param userStory The user story that the notification is about
     * @param senderId  ID of the user who triggered the notification
     */
    private void createAssigneeNotification(User receiver, UserStory userStory, Long senderId) {
        String description = "You have been assigned to user story #" + userStory.getId() + ": " + userStory.getName();
        notificationService.createNotification(
                receiver,
                description,
                userStory.getId(),
                "USER_STORY_ASSIGNED",
                senderId);
    }

    /**
     * Create a notification for a watcher of a user story
     * 
     * @param receiver  The user to receive the notification
     * @param userStory The user story that the notification is about
     * @param senderId  ID of the user who triggered the notification
     */
    private void createWatcherNotification(User receiver, UserStory userStory, Long senderId) {
        String description = "You are now watching user story #" + userStory.getId() + ": " + userStory.getName();
        notificationService.createNotification(
                receiver,
                description,
                userStory.getId(),
                "USER_STORY_WATCHING",
                senderId);
    }

    /**
     * Lấy tất cả các trạng thái có thể có của UserStory cho một dự án
     * 
     * @param projectId ID của dự án
     * @return Danh sách các trạng thái
     */
    @GetMapping("/project/{projectId}/statuses")
    public ResponseEntity<?> getUserStoryStatuses(@PathVariable Long projectId) {
        try {
            List<PjStatusDTO> statuses = userStoryService.getUserStoryStatuses(projectId);
            return ResponseEntity.ok(statuses);
        } catch (RequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }

    /**
     * Delete a comment from a user story
     * Any user can delete comments
     */
    @DeleteMapping("/userstory/{userStoryId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Integer userStoryId,
            @PathVariable Long commentId) {
        try {
            User user = securityUtils.getCurrentUser();
            Long userId = user.getId();

            // Find comment directly without loading the entire user story
            Optional<Comment> commentOptional = commentRepository.findById(commentId);
            if (!commentOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found");
            }

            Comment comment = commentOptional.get();

            // Verify the comment belongs to the user story
            if (comment.getUserStory() == null || !comment.getUserStory().getId().equals(userStoryId)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Comment does not belong to this user story");
            }

            // Store necessary info for activity logging before deletion
            Integer userStoryIdForLog = userStoryId;
            Long projectId = null;

            try {
                if (comment.getUserStory() != null && comment.getUserStory().getProject() != null) {
                    projectId = comment.getUserStory().getProject().getId();
                }
            } catch (Exception e) {
                // Ignore if we can't get project ID, we'll skip logging activity
                System.err.println("Failed to get project ID for activity logging: " + e.getMessage());
            }

            // Delete the comment
            commentRepository.delete(comment);

            // Explicitly flush to ensure immediate database update
            commentRepository.flush();

            // Record activity only if we have project ID
            if (projectId != null) {
                try {
                    activityService.recordUserStoryActivity(
                            projectId,
                            userStoryIdForLog,
                            userId,
                            "comment_deleted",
                            "Deleted a comment");
                } catch (Exception e) {
                    // Just log the error but don't fail the request
                    System.err.println("Failed to record comment deletion activity: " + e.getMessage());
                }
            }

            return ResponseEntity.ok().body("Comment deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting comment: " + e.getMessage());
        }
    }

    @PutMapping("/userstory/{id}/soft-delete")
    public ResponseEntity<?> softDeleteUserStory(@PathVariable Integer id) {
        try {
            Optional<UserStory> userStoryOpt = userStoryRepository.findById(id);
            if (!userStoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            UserStory userStory = userStoryOpt.get();

            // Get user ID for activity recording
            Long userId = 1L; // Default
            try {
                ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                        .getRequestAttributes();
                if (requestAttributes != null) {
                    HttpServletRequest request = requestAttributes.getRequest();
                    String userIdHeader = request.getHeader("User-Id");
                    if (userIdHeader != null) {
                        userId = Long.parseLong(userIdHeader);
                    }
                }
            } catch (Exception e) {
                // Fallback to default
            }

            // Record activity before soft deletion
            activityService.recordUserStoryActivity(
                    userStory.getProject().getId(),
                    userStory.getId(),
                    userId,
                    "user_story_deleted",
                    "User story \"" + userStory.getName() + "\" was deleted");

            // Perform soft delete
            userStory.setIsDeleted(true);
            userStoryRepository.save(userStory);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete user story: " + e.getMessage());
        }
    }
}