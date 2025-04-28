package edu.ptit.ttcs.controller;

import edu.ptit.ttcs.dao.ProjectSettingTagRepository;
import edu.ptit.ttcs.dao.TaskRepository;
import edu.ptit.ttcs.dao.UserRepository;
import edu.ptit.ttcs.dao.UserStoryRepository;
import edu.ptit.ttcs.dao.ProjectMemberRepository;
import edu.ptit.ttcs.dao.CommentRepository;
import edu.ptit.ttcs.entity.dto.TaskDTO;
import edu.ptit.ttcs.entity.dto.request.TaskRequestDTO;
import edu.ptit.ttcs.entity.ProjectSettingTag;
import edu.ptit.ttcs.entity.Task;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.UserStory;
import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.ProjectSettingStatus;
import edu.ptit.ttcs.entity.Comment;
import edu.ptit.ttcs.entity.dto.CommentDTO;
import edu.ptit.ttcs.entity.dto.ActivityDTO;
import edu.ptit.ttcs.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
        RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowedHeaders = { "Content-Type",
                "Authorization", "User-Id" }, exposedHeaders = { "Content-Type", "Authorization", "User-Id" })
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserStoryRepository userStoryRepository;

    @Autowired
    private ProjectSettingTagRepository tagRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ActivityService activityService;

    private Long getUserIdFromHeader() {
        try {
            ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (requestAttributes != null) {
                HttpServletRequest request = requestAttributes.getRequest();
                String userIdHeader = request.getHeader("User-Id");
                if (userIdHeader != null) {
                    return Long.parseLong(userIdHeader);
                }
            }
        } catch (Exception e) {
            // Fallback to default
        }
        return 1L; // Default user ID
    }

    /**
     * Get all tasks
     *
     * @return List of tasks
     */
    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        List<TaskDTO> taskDTOs = tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDTOs);
    }

    /**
     * Get task by ID
     *
     * @param id Task ID
     * @return Task if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Integer id) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        return taskOptional.map(task -> ResponseEntity.ok(convertToDTO(task)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get tasks by user story
     *
     * @param userStoryId User story ID
     * @return List of tasks
     */
    @GetMapping("/userstory/{userStoryId}")
    public ResponseEntity<List<TaskDTO>> getTasksByUserStory(@PathVariable Integer userStoryId) {
        Optional<UserStory> userStoryOptional = userStoryRepository.findById(userStoryId);
        if (!userStoryOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        List<Task> tasks = taskRepository.findByUserStory(userStoryOptional.get());
        List<TaskDTO> taskDTOs = tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDTOs);
    }

    /**
     * Get tasks assigned to user
     *
     * @param userId User ID
     * @return List of tasks
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskDTO>> getTasksByUser(@PathVariable Integer userId) {
        Optional<User> userOptional = userRepository.findById(userId.longValue());
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        List<Task> tasks = taskRepository.findByUser(userOptional.get());
        List<TaskDTO> taskDTOs = tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDTOs);
    }

    /**
     * Create new task
     *
     * @param taskRequestDTO Task request data
     * @return Created task
     */
    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskRequestDTO taskRequestDTO) {
        try {
            // Validate required fields
            if (taskRequestDTO.getName() == null || taskRequestDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Validate user story exists
            if (taskRequestDTO.getUserStoryId() == null) {
                return ResponseEntity.badRequest().build();
            }

            Optional<UserStory> userStoryOptional = userStoryRepository.findById(taskRequestDTO.getUserStoryId());
            if (!userStoryOptional.isPresent()) {
                return ResponseEntity.badRequest().build();
            }

            // Validate user story has a project
            UserStory userStory = userStoryOptional.get();
            if (userStory.getProject() == null) {
                return ResponseEntity.badRequest().build();
            }

            // Create and save task
            Task task = convertToEntity(taskRequestDTO);
            Task savedTask = taskRepository.save(task);

            // Record activity for task creation
            activityService.recordTaskActivity(
                    savedTask.getProject().getId(),
                    savedTask.getId(),
                    getUserIdFromHeader(),
                    "task_created",
                    "Task \"" + savedTask.getName() + "\" was created");

            return new ResponseEntity<>(convertToDTO(savedTask), HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace(); // Add logging
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update task
     *
     * @param id             Task ID
     * @param taskRequestDTO Updated task data
     * @return Updated task
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Integer id, @RequestBody TaskRequestDTO taskRequestDTO) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        if (!taskOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Task task = taskOptional.get();
            String oldName = task.getName();
            String oldDescription = task.getDescription();
            LocalDate oldDueDate = task.getDueDate();
            ProjectSettingStatus oldStatus = task.getStatus();

            updateTaskFromDTO(task, taskRequestDTO);
            Task updatedTask = taskRepository.save(task);

            // Record activities for changes
            Long userId = getUserIdFromHeader();
            Long projectId = updatedTask.getProject().getId();

            // Name change
            if (!oldName.equals(updatedTask.getName())) {
                activityService.recordTaskActivity(
                        projectId,
                        updatedTask.getId(),
                        userId,
                        "name_updated",
                        "Name changed from \"" + oldName + "\" to \"" + updatedTask.getName() + "\"");
            }

            // Description change
            if (oldDescription != null && !oldDescription.equals(updatedTask.getDescription())) {
                activityService.recordTaskActivity(
                        projectId,
                        updatedTask.getId(),
                        userId,
                        "description_updated",
                        "Description updated");
            }

            // Due date change
            if (oldDueDate != null && !oldDueDate.equals(updatedTask.getDueDate())) {
                activityService.recordTaskActivity(
                        projectId,
                        updatedTask.getId(),
                        userId,
                        "due_date_updated",
                        "Due date changed from " + oldDueDate + " to " + updatedTask.getDueDate());
            }

            // Status change
            if (oldStatus != null && !oldStatus.getId().equals(updatedTask.getStatus().getId())) {
                activityService.recordTaskActivity(
                        projectId,
                        updatedTask.getId(),
                        userId,
                        "status_updated",
                        "Status changed from " + oldStatus.getName() + " to " + updatedTask.getStatus().getName());
            }

            return ResponseEntity.ok(convertToDTO(updatedTask));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete task
     *
     * @param id Task ID
     * @return No content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        if (!taskOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOptional.get();

        // Record activity before deletion
        activityService.recordTaskActivity(
                task.getProject().getId(),
                task.getId(),
                getUserIdFromHeader(),
                "task_deleted",
                "Task \"" + task.getName() + "\" was deleted");

        taskRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Phương thức helper để kiểm tra người dùng có trong project không
     */
    private boolean isUserInProject(Integer taskId, Long userId) {
        Optional<Task> taskOptional = taskRepository.findById(taskId);
        if (!taskOptional.isPresent() || taskOptional.get().getUserStory() == null
                || taskOptional.get().getUserStory().getProject() == null) {
            return false;
        }

        Long projectId = taskOptional.get().getUserStory().getProject().getId();
        return projectMemberRepository.existsByProjectIdAndUserIdAndIsDeleteFalse(projectId, userId);
    }

    /**
     * Add API endpoint to manage task assignees
     */
    @PostMapping("/{taskId}/assignees")
    public ResponseEntity<TaskDTO> updateTaskAssignees(
            @PathVariable Integer taskId,
            @RequestBody AssignTaskRequest request) {
        try {
            Optional<Task> taskOptional = taskRepository.findById(taskId);
            if (!taskOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Task task = taskOptional.get();
            List<ProjectMember> oldAssignees = new ArrayList<>(task.getAssignees());

            // Update assignees
            List<ProjectMember> assignees = new ArrayList<>();
            for (Integer userId : request.getUserIds()) {
                ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                        task.getProject().getId(), userId.longValue());
                if (projectMember != null) {
                    assignees.add(projectMember);
                }
            }
            task.setAssignees(assignees);
            Task updatedTask = taskRepository.save(task);

            // Record activities for assignee changes
            Long userId = getUserIdFromHeader();
            Long projectId = updatedTask.getProject().getId();

            // Check for added assignees
            for (ProjectMember newAssignee : assignees) {
                if (!oldAssignees.contains(newAssignee)) {
                    activityService.recordTaskActivity(
                            projectId,
                            updatedTask.getId(),
                            userId,
                            "assignee_added",
                            "User " + newAssignee.getUser().getUsername() + " assigned to task");
                }
            }

            // Check for removed assignees
            for (ProjectMember oldAssignee : oldAssignees) {
                if (!assignees.contains(oldAssignee)) {
                    activityService.recordTaskActivity(
                            projectId,
                            updatedTask.getId(),
                            userId,
                            "assignee_removed",
                            "User " + oldAssignee.getUser().getUsername() + " removed from task");
                }
            }

            return ResponseEntity.ok(convertToDTO(updatedTask));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Support class for assignee requests
     */
    public static class AssignTaskRequest {
        private List<Integer> userIds;

        public List<Integer> getUserIds() {
            return userIds;
        }

        public void setUserIds(List<Integer> userIds) {
            this.userIds = userIds;
        }
    }

    /**
     * Add single user as assignee to task
     */
    @PostMapping("/{taskId}/assignees/{userId}")
    public ResponseEntity<TaskDTO> addAssignee(
            @PathVariable Integer taskId,
            @PathVariable Integer userId) {

        try {
            // Find task
            Optional<Task> taskOptional = taskRepository.findById(taskId);
            if (!taskOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            // Find user
            Optional<User> userOptional = userRepository.findById(userId.longValue());
            if (!userOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Task task = taskOptional.get();
            User user = userOptional.get();

            // Kiểm tra xem người dùng có thuộc project không
            Long projectId = null;
            if (task.getUserStory() != null && task.getUserStory().getProject() != null) {
                projectId = task.getUserStory().getProject().getId();
            } else {
                return ResponseEntity.badRequest().build(); // Task phải thuộc một project
            }

            boolean isInProject = projectMemberRepository.existsByProjectIdAndUserIdAndIsDeleteFalse(
                    projectId, user.getId());

            if (!isInProject) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(null); // Người dùng không thuộc project
            }

            ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                    task.getProject().getId(), user.getId());

            // Initialize list if null
            if (task.getAssignees() == null) {
                task.setAssignees(new ArrayList<>());
            }

            // Add user if not already in list
            if (!task.getAssignees().contains(projectMember)) {
                task.getAssignees().add(projectMember);
                task = taskRepository.save(task);
            }

            return ResponseEntity.ok(convertToDTO(task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Remove assignee from task
     */
    @DeleteMapping("/{taskId}/assignees/{userId}")
    public ResponseEntity<TaskDTO> removeAssignee(
            @PathVariable Integer taskId,
            @PathVariable Integer userId) {

        try {
            // Find task
            Optional<Task> taskOptional = taskRepository.findById(taskId);
            if (!taskOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            // Find user
            Optional<User> userOptional = userRepository.findById(userId.longValue());
            if (!userOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Task task = taskOptional.get();
            User user = userOptional.get();

            // Remove user if in list
            if (task.getAssignees() != null) {
                task.getAssignees().remove(user);
                task = taskRepository.save(task);
            }

            return ResponseEntity.ok(convertToDTO(task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * API endpoint to get available assignees for a task
     */
    @GetMapping("/{taskId}/available-assignees")
    public ResponseEntity<List<TaskDTO.UserDTO>> getAvailableAssignees(@PathVariable Integer taskId) {
        try {
            // Find task
            Optional<Task> taskOptional = taskRepository.findById(taskId);
            if (!taskOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Task task = taskOptional.get();

            // Lấy project ID từ task
            Long projectId = null;
            if (task.getUserStory() != null && task.getUserStory().getProject() != null) {
                projectId = task.getUserStory().getProject().getId();
            } else {
                return ResponseEntity.badRequest().build(); // Task phải thuộc một project
            }

            // Lấy danh sách thành viên project
            List<ProjectMember> projectMembers = projectMemberRepository.findByProjectIdAndIsDeleteFalse(projectId);

            // Chuyển đổi thành UserDTO để trả về
            List<TaskDTO.UserDTO> userDTOs = projectMembers.stream()
                    .map(member -> {
                        TaskDTO.UserDTO dto = new TaskDTO.UserDTO();
                        dto.setId(member.getUser().getId().intValue());
                        dto.setUsername(member.getUser().getUsername());
                        dto.setFullName(member.getUser().getFullName());
                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * API endpoint to update watchers for a task
     */
    @PostMapping("/{taskId}/watchers")
    public ResponseEntity<TaskDTO> updateTaskWatchers(
            @PathVariable Integer taskId,
            @RequestBody UpdateWatchersRequest request) {
        try {
            Optional<Task> taskOptional = taskRepository.findById(taskId);
            if (!taskOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Task task = taskOptional.get();
            List<ProjectMember> oldWatchers = new ArrayList<>(task.getWatchers());

            // Update watchers
            List<ProjectMember> watchers = new ArrayList<>();
            for (Integer userId : request.getWatcherIds()) {
                ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                        task.getProject().getId(), userId.longValue());
                if (projectMember != null) {
                    watchers.add(projectMember);
                }
            }
            task.setWatchers(watchers);
            Task updatedTask = taskRepository.save(task);

            // Record activities for watcher changes
            Long userId = getUserIdFromHeader();
            Long projectId = updatedTask.getProject().getId();

            // Check for added watchers
            for (ProjectMember newWatcher : watchers) {
                if (!oldWatchers.contains(newWatcher)) {
                    activityService.recordTaskActivity(
                            projectId,
                            updatedTask.getId(),
                            userId,
                            "watcher_added",
                            "User " + newWatcher.getUser().getUsername() + " started watching task");
                }
            }

            // Check for removed watchers
            for (ProjectMember oldWatcher : oldWatchers) {
                if (!watchers.contains(oldWatcher)) {
                    activityService.recordTaskActivity(
                            projectId,
                            updatedTask.getId(),
                            userId,
                            "watcher_removed",
                            "User " + oldWatcher.getUser().getUsername() + " stopped watching task");
                }
            }

            return ResponseEntity.ok(convertToDTO(updatedTask));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Add single user as watcher to task
     */
    @PostMapping("/{taskId}/watchers/{userId}")
    public ResponseEntity<TaskDTO> addWatcher(
            @PathVariable Integer taskId,
            @PathVariable Integer userId) {

        try {
            // Find task
            Optional<Task> taskOptional = taskRepository.findById(taskId);
            if (!taskOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            // Find user
            Optional<User> userOptional = userRepository.findById(userId.longValue());
            if (!userOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Task task = taskOptional.get();
            User user = userOptional.get();

            // Kiểm tra xem người dùng có thuộc project không
            Long projectId = null;
            if (task.getUserStory() != null && task.getUserStory().getProject() != null) {
                projectId = task.getUserStory().getProject().getId();
            } else {
                return ResponseEntity.badRequest().build(); // Task phải thuộc một project
            }

            boolean isInProject = projectMemberRepository.existsByProjectIdAndUserIdAndIsDeleteFalse(
                    projectId, user.getId());

            if (!isInProject) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(null); // Người dùng không thuộc project
            }

            // Initialize list if null
            if (task.getWatchers() == null) {
                task.setWatchers(new ArrayList<>());
            }

            ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                    task.getProject().getId(), user.getId());

            // Add user if not already in list
            if (!task.getWatchers().contains(projectMember)) {
                task.getWatchers().add(projectMember);
                task = taskRepository.save(task);
            }

            return ResponseEntity.ok(convertToDTO(task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Remove watcher from task
     */
    @DeleteMapping("/{taskId}/watchers/{userId}")
    public ResponseEntity<TaskDTO> removeWatcher(
            @PathVariable Integer taskId,
            @PathVariable Integer userId) {

        try {
            // Find task
            Optional<Task> taskOptional = taskRepository.findById(taskId);
            if (!taskOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            // Find user
            Optional<User> userOptional = userRepository.findById(userId.longValue());
            if (!userOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Task task = taskOptional.get();
            ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                    task.getProject().getId(), userId.longValue());

            // Remove user if in list
            if (task.getWatchers() != null) {
                task.getWatchers().remove(projectMember);
                task = taskRepository.save(task);
            }

            return ResponseEntity.ok(convertToDTO(task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Support class for watcher requests
     */
    public static class UpdateWatchersRequest {
        private List<Integer> watcherIds;

        public List<Integer> getWatcherIds() {
            return watcherIds;
        }

        public void setWatcherIds(List<Integer> watcherIds) {
            this.watcherIds = watcherIds;
        }
    }

    /**
     * Update task status
     *
     * @param id     Task ID
     * @param status New status
     * @return Updated task
     */
    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<TaskDTO> updateTaskStatus(
            @PathVariable Integer id,
            @PathVariable String status) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        if (!taskOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Task task = taskOptional.get();
            ProjectSettingStatus oldStatus = task.getStatus();

            // Validate status
            if (!isValidStatus(status)) {
                return ResponseEntity.badRequest().build();
            }

            // Convert string status to ProjectSettingStatus
            ProjectSettingStatus projectSettingStatus = new ProjectSettingStatus();
            projectSettingStatus.setName(status);
            // Set ID based on status name
            switch (status) {
                case "NEW":
                    projectSettingStatus.setId(1);
                    break;
                case "IN_PROGRESS":
                    projectSettingStatus.setId(2);
                    break;
                case "READY_FOR_TEST":
                    projectSettingStatus.setId(3);
                    break;
                case "TESTING":
                    projectSettingStatus.setId(4);
                    break;
                case "DONE":
                    projectSettingStatus.setId(5);
                    break;
                case "CLOSED":
                    projectSettingStatus.setId(6);
                    break;
                default:
                    return ResponseEntity.badRequest().build();
            }
            task.setStatus(projectSettingStatus);

            Task updatedTask = taskRepository.save(task);

            // Record activity for status change
            activityService.recordTaskActivity(
                    updatedTask.getProject().getId(),
                    updatedTask.getId(),
                    getUserIdFromHeader(),
                    "status_updated",
                    "Status changed from " + (oldStatus != null ? oldStatus.getName() : "None") + " to " + status);

            return ResponseEntity.ok(convertToDTO(updatedTask));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Check if status is valid
     */
    private boolean isValidStatus(String status) {
        return status != null && (status.equals("NEW") ||
                status.equals("IN_PROGRESS") ||
                status.equals("READY_FOR_TEST") ||
                status.equals("TESTING") ||
                status.equals("DONE") ||
                status.equals("CLOSED"));
    }

    /**
     * Update task description
     */
    @PutMapping("/{id}/description")
    public ResponseEntity<TaskDTO> updateTaskDescription(
            @PathVariable Integer id,
            @RequestBody UpdateDescriptionRequest request) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        if (!taskOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Task task = taskOptional.get();
            task.setDescription(request.getDescription());
            Task updatedTask = taskRepository.save(task);
            return ResponseEntity.ok(convertToDTO(updatedTask));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Request class for description update
     */
    public static class UpdateDescriptionRequest {
        private String description;

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    /**
     * Update task due date
     */
    @PutMapping("/{id}/due-date")
    public ResponseEntity<TaskDTO> updateTaskDueDate(
            @PathVariable Integer id,
            @RequestBody UpdateDueDateRequest request) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        if (!taskOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Task task = taskOptional.get();
            task.setDueDate(request.getDueDate());
            Task updatedTask = taskRepository.save(task);
            return ResponseEntity.ok(convertToDTO(updatedTask));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Request class for due date update
     */
    public static class UpdateDueDateRequest {
        private LocalDate dueDate;

        public LocalDate getDueDate() {
            return dueDate;
        }

        public void setDueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
        }
    }

    /**
     * Update task block status
     */
    @PutMapping("/{id}/block")
    public ResponseEntity<TaskDTO> updateTaskBlockStatus(
            @PathVariable Integer id,
            @RequestBody UpdateBlockStatusRequest request) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        if (!taskOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Task task = taskOptional.get();
            Boolean oldBlockStatus = task.getIsBlocked();
            task.setIsBlocked(request.getIsBlocked());
            Task updatedTask = taskRepository.save(task);

            // Record activity for block status change
            if (oldBlockStatus != request.getIsBlocked()) {
                activityService.recordTaskActivity(
                        updatedTask.getProject().getId(),
                        updatedTask.getId(),
                        getUserIdFromHeader(),
                        "block_status_updated",
                        request.getIsBlocked() ? "Task blocked" : "Task unblocked");
            }

            return ResponseEntity.ok(convertToDTO(updatedTask));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Request class for block status update
     */
    public static class UpdateBlockStatusRequest {
        private Boolean isBlocked;

        public Boolean getIsBlocked() {
            return isBlocked;
        }

        public void setIsBlocked(Boolean isBlocked) {
            this.isBlocked = isBlocked;
        }
    }

    /**
     * Add comment to task
     */
    @PostMapping("/{taskId}/comments")
    public ResponseEntity<List<CommentDTO>> addComment(
            @PathVariable Integer taskId,
            @RequestBody AddCommentRequest request) {
        try {
            Optional<Task> taskOptional = taskRepository.findById(taskId);
            if (!taskOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Task task = taskOptional.get();
            Optional<User> userOptional = userRepository.findById(request.getUserId().longValue());
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().build();
            }

            Comment comment = new Comment();
            comment.setContent(request.getContent());
            comment.setTask(task);
            comment.setUser(userOptional.get());
            comment.setCreatedAt(LocalDateTime.now());
            comment.setUpdatedAt(LocalDateTime.now());

            comment = commentRepository.save(comment);

            // Record activity for comment
            activityService.recordTaskActivity(
                    task.getProject().getId(),
                    task.getId(),
                    userOptional.get().getId(),
                    "comment_added",
                    "Added a comment: " + request.getContent());

            List<Comment> comments = commentRepository.findByTaskOrderByCreatedAtDesc(task);
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
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get comments for task
     */
    @GetMapping("/{taskId}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Integer taskId) {
        try {
            // Find task
            Optional<Task> taskOptional = taskRepository.findById(taskId);
            if (!taskOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Task task = taskOptional.get();

            // Get comments
            List<Comment> comments = commentRepository.findByTaskOrderByCreatedAtDesc(task);

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

    /**
     * Request class for adding comments
     */
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

    /**
     * Convert Task entity to TaskDTO
     *
     * @param task Task entity
     * @return TaskDTO
     */
    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setSubject(task.getName());
        dto.setDescription(task.getDescription());
        dto.setDueDate(task.getDueDate());
        dto.setIsBlocked(task.getIsBlocked());
        dto.setPoints(task.getPoints());

        // Set status info if available
        if (task.getStatus() != null) {
            dto.setStatusId(task.getStatus().getId().intValue());
            dto.setStatusName(task.getStatus().getName());
        }

        // Set user story info if available
        if (task.getUserStory() != null) {
            dto.setUserStoryId(task.getUserStory().getId());
            dto.setUserStoryName(task.getUserStory().getName());
        }

        // Set assignee info if available
        if (task.getUser() != null) {
            dto.setAssignedTo(task.getUser().getId().intValue());
            dto.setAssignedToName(task.getUser().getFullName());
        }

        // Set assignees info if available
        if (task.getAssignees() != null && !task.getAssignees().isEmpty()) {
            List<TaskDTO.UserDTO> assigneeDTOs = task.getAssignees().stream()
                    .map(assignee -> {
                        TaskDTO.UserDTO userDTO = new TaskDTO.UserDTO();
                        userDTO.setId(assignee.getId().intValue());
                        userDTO.setUsername(assignee.getUser().getUsername());
                        userDTO.setFullName(assignee.getUser().getFullName());
                        return userDTO;
                    })
                    .collect(Collectors.toList());
            dto.setAssignees(assigneeDTOs);
        }

        // Set tags if available
        if (task.getTags() != null && !task.getTags().isEmpty()) {
            List<TaskDTO.TagDTO> tagDTOs = task.getTags().stream()
                    .map(tag -> {
                        TaskDTO.TagDTO tagDTO = new TaskDTO.TagDTO();
                        tagDTO.setId(tag.getId().intValue());
                        tagDTO.setName(tag.getName());
                        tagDTO.setColor(tag.getColor());
                        return tagDTO;
                    })
                    .collect(Collectors.toList());
            dto.setTags(tagDTOs);
        }

        // Set watchers if available
        if (task.getWatchers() != null && !task.getWatchers().isEmpty()) {
            List<TaskDTO.UserDTO> watcherDTOs = task.getWatchers().stream()
                    .map(watcher -> {
                        TaskDTO.UserDTO userDTO = new TaskDTO.UserDTO();
                        userDTO.setId(watcher.getId().intValue());
                        userDTO.setUsername(watcher.getUser().getUsername());
                        userDTO.setFullName(watcher.getUser().getFullName());
                        return userDTO;
                    })
                    .collect(Collectors.toList());
            dto.setWatchers(watcherDTOs);
        }

        return dto;
    }

    /**
     * Convert TaskRequestDTO to Task entity
     *
     * @param taskRequestDTO TaskRequestDTO
     * @return Task entity
     * @throws Exception if required data is missing
     */
    private Task convertToEntity(TaskRequestDTO taskRequestDTO) throws Exception {
        if (taskRequestDTO.getName() == null || taskRequestDTO.getName().isEmpty()) {
            throw new Exception("Task name is required");
        }

        Task task = new Task();
        updateTaskFromDTO(task, taskRequestDTO);

        // Set project from user story if available
        if (task.getUserStory() != null && task.getUserStory().getProject() != null) {
            task.setProject(task.getUserStory().getProject());
        } else {
            throw new Exception("Task must be associated with a project through a user story");
        }

        return task;
    }

    /**
     * Update Task entity from TaskRequestDTO
     *
     * @param task           Task entity to update
     * @param taskRequestDTO Source TaskRequestDTO
     * @throws Exception if required relationships cannot be established
     */
    private void updateTaskFromDTO(Task task, TaskRequestDTO taskRequestDTO) throws Exception {
        // Set basic fields
        task.setName(taskRequestDTO.getName());
        task.setDescription(taskRequestDTO.getDescription());
        task.setDueDate(taskRequestDTO.getDueDate());

        // Set points if provided
        if (taskRequestDTO.getPoints() != null) {
            task.setPoints(taskRequestDTO.getPoints());
        }

        // Set status if provided
        if (taskRequestDTO.getStatusId() != null) {
            ProjectSettingStatus status = new ProjectSettingStatus();
            status.setId(taskRequestDTO.getStatusId());
            task.setStatus(status);
        }

        // Set user (assignee) - Giữ lại để tương thích ngược
        if (taskRequestDTO.getUserId() != null) {
            Optional<User> userOptional = userRepository.findById(taskRequestDTO.getUserId().longValue());
            if (!userOptional.isPresent()) {
                throw new Exception("Assigned user not found");
            }
            task.setUser(userOptional.get());
        } else {
            task.setUser(null);
        }

        // Set user story first, as it's needed for project reference
        if (taskRequestDTO.getUserStoryId() != null) {
            Optional<UserStory> userStoryOptional = userStoryRepository.findById(taskRequestDTO.getUserStoryId());
            if (!userStoryOptional.isPresent()) {
                throw new Exception("User story not found");
            }
            UserStory userStory = userStoryOptional.get();
            task.setUserStory(userStory);

            // Set project from user story
            if (userStory.getProject() != null) {
                task.setProject(userStory.getProject());
            } else {
                throw new Exception("User story is not associated with a project");
            }
        } else {
            throw new Exception("User story ID is required");
        }

        // Set multiple assignees - Quan hệ mới nhiều-nhiều
        if (taskRequestDTO.getAssigneeIds() != null && !taskRequestDTO.getAssigneeIds().isEmpty()) {
            List<ProjectMember> assignees = new ArrayList<>();
            for (Integer assigneeId : taskRequestDTO.getAssigneeIds()) {
                ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                        task.getProject().getId(), assigneeId.longValue());
                if (projectMember != null) {
                    assignees.add(projectMember);
                } else {
                    throw new Exception("Assignee with ID " + assigneeId + " is not a member of this project");
                }
            }
            task.setAssignees(assignees);
        } else {
            task.setAssignees(new ArrayList<>());
        }

        // Set tags if provided
        if (taskRequestDTO.getTagIds() != null && !taskRequestDTO.getTagIds().isEmpty()) {
            List<ProjectSettingTag> tags = new ArrayList<>();
            for (Integer tagId : taskRequestDTO.getTagIds()) {
                Optional<ProjectSettingTag> tagOptional = tagRepository.findById(tagId);
                if (tagOptional.isPresent()) {
                    tags.add(tagOptional.get());
                }
            }
            task.setTags(tags);
        }

        // Set watchers if provided
        if (taskRequestDTO.getWatcherIds() != null && !taskRequestDTO.getWatcherIds().isEmpty()) {
            List<ProjectMember> watchers = new ArrayList<>();
            for (Integer watcherId : taskRequestDTO.getWatcherIds()) {
                ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                        task.getProject().getId(), watcherId.longValue());
                if (projectMember != null) {
                    watchers.add(projectMember);
                }
            }
            task.setWatchers(watchers);
        }
    }

    // @GetMapping("/{taskId}/activities")
    // public ResponseEntity<List<ActivityDTO>> getTaskActivities(@PathVariable
    // Integer taskId) {
    // try {
    // Long userId = getUserIdFromHeader();
    // List<ActivityDTO> activities = activityService.getTaskActivities(taskId,
    // userId);
    // return ResponseEntity.ok(activities);
    // } catch (Exception e) {
    // return ResponseEntity.badRequest().build();
    // }
    // }

    /**
     * Update task points
     *
     * @param id      Task ID
     * @param request Update points request
     * @return Updated task
     */
    @PutMapping("/{id}/points")
    public ResponseEntity<TaskDTO> updateTaskPoints(
            @PathVariable Integer id,
            @RequestBody UpdatePointsRequest request) {
        try {
            Optional<Task> taskOptional = taskRepository.findById(id);
            if (!taskOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Task task = taskOptional.get();
            Integer oldPoints = task.getPoints();
            task.setPoints(request.getPoints());
            Task updatedTask = taskRepository.save(task);

            // Record activity for points change
            activityService.recordTaskActivity(
                    updatedTask.getProject().getId(),
                    updatedTask.getId(),
                    getUserIdFromHeader(),
                    "points_updated",
                    String.format("Points changed from %s to %s", oldPoints != null ? oldPoints : 0,
                            request.getPoints() != null ? request.getPoints() : 0));

            return ResponseEntity.ok(convertToDTO(updatedTask));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Request class for updating points
     */
    public static class UpdatePointsRequest {
        private Integer points;

        public Integer getPoints() {
            return points;
        }

        public void setPoints(Integer points) {
            this.points = points;
        }
    }
}