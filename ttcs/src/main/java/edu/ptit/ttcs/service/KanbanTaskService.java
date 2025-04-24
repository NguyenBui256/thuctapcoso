package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dto.KanbanTaskDTO;
import edu.ptit.ttcs.entity.KanbanTask;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.dao.KanbanTaskRepository;
import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.dao.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KanbanTaskService {

    @Autowired
    private KanbanTaskRepository kanbanTaskRepository;

    @Autowired
    private KanbanSwimlandService kanbanSwimlandService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public List<KanbanTaskDTO> getAllTasksByProject(Integer projectId) {
        List<KanbanTask> tasks = kanbanTaskRepository.findByProjectId(projectId);
        return tasks.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<KanbanTaskDTO> getTasksBySwimland(Integer swimlandId) {
        List<KanbanTask> tasks = kanbanTaskRepository.findBySwimlandIdOrderByOrder(swimlandId);
        return tasks.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<KanbanTaskDTO> getTasksByStatus(Integer projectId, String status) {
        List<KanbanTask> tasks = kanbanTaskRepository.findByProjectIdAndStatusOrderByOrder(projectId, status);
        return tasks.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public KanbanTaskDTO createTask(KanbanTaskDTO taskDTO) {
        KanbanTask task = new KanbanTask();
        updateTaskFromDTO(task, taskDTO);

        // Generate next task number for the project
        Integer maxTaskNumber = kanbanTaskRepository.findMaxTaskNumberByProjectId(taskDTO.getProjectId());
        task.setTaskNumber(maxTaskNumber != null ? maxTaskNumber + 1 : 1);

        // Set default order to be last in the swimland
        List<KanbanTask> swimlandTasks = kanbanTaskRepository.findBySwimlandIdOrderByOrder(taskDTO.getSwimlandId());
        int maxOrder = swimlandTasks.isEmpty() ? 0
                : swimlandTasks.stream().mapToInt(KanbanTask::getOrder).max().orElse(0);
        task.setOrder(maxOrder + 1);

        KanbanTask savedTask = kanbanTaskRepository.save(task);
        return convertToDTO(savedTask);
    }

    @Transactional
    public KanbanTaskDTO updateTask(Integer taskId, KanbanTaskDTO taskDTO) {
        KanbanTask task = kanbanTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id " + taskId));

        updateTaskFromDTO(task, taskDTO);
        KanbanTask updatedTask = kanbanTaskRepository.save(task);
        return convertToDTO(updatedTask);
    }

    @Transactional
    public void deleteTask(Integer taskId) {
        kanbanTaskRepository.deleteById(taskId);
    }

    @Transactional
    public void updateTaskStatus(Integer taskId, String status, Integer swimlandId) {
        KanbanTask task = kanbanTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id " + taskId));

        task.setStatus(status);
        if (swimlandId != null && !swimlandId.equals(task.getSwimland().getId())) {
            task.setSwimland(kanbanSwimlandService.getSwimlandEntityById(swimlandId));

            // Set order to be last in the new swimland
            List<KanbanTask> swimlandTasks = kanbanTaskRepository.findBySwimlandIdOrderByOrder(swimlandId);
            int maxOrder = swimlandTasks.isEmpty() ? 0
                    : swimlandTasks.stream().mapToInt(KanbanTask::getOrder).max().orElse(0);
            task.setOrder(maxOrder + 1);
        }

        kanbanTaskRepository.save(task);
    }

    @Transactional
    public void reorderTasks(Integer swimlandId, List<Integer> taskIds) {
        for (int i = 0; i < taskIds.size(); i++) {
            KanbanTask task = kanbanTaskRepository.findById(taskIds.get(i))
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            task.setOrder(i + 1);
            task.setSwimland(kanbanSwimlandService.getSwimlandEntityById(swimlandId));
            kanbanTaskRepository.save(task);
        }
    }

    private void updateTaskFromDTO(KanbanTask task, KanbanTaskDTO dto) {
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setDueDate(dto.getDueDate());
        task.setPriority(dto.getPriority());

        if (dto.getAssigneeId() != null) {
            User user = userRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("User not found with id " + dto.getAssigneeId()));
            task.setAssignee(user);
        }

        if (dto.getSwimlandId() != null) {
            task.setSwimland(kanbanSwimlandService.getSwimlandEntityById(dto.getSwimlandId()));
        }

        if (dto.getProjectId() != null) {
            Project project = projectRepository.findById(dto.getProjectId().longValue())
                    .orElseThrow(() -> new RuntimeException("Project not found with id " + dto.getProjectId()));
            task.setProject(project);
        }
    }

    private KanbanTaskDTO convertToDTO(KanbanTask task) {
        KanbanTaskDTO dto = new KanbanTaskDTO();
        dto.setId(task.getId());
        dto.setTaskNumber(task.getTaskNumber());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setOrder(task.getOrder());
        dto.setStatus(task.getStatus());
        dto.setDueDate(task.getDueDate());
        dto.setPriority(task.getPriority());

        if (task.getAssignee() != null) {
            dto.setAssigneeId(task.getAssignee().getId().intValue());
            dto.setAssigneeName(task.getAssignee().getFullName());
            dto.setAssigneeAvatar(task.getAssignee().getAvatar());
        }

        if (task.getSwimland() != null) {
            dto.setSwimlandId(task.getSwimland().getId());
            dto.setSwimlandName(task.getSwimland().getName());
        }

        if (task.getProject() != null) {
            dto.setProjectId(task.getProject().getId().intValue());
        }

        // dto.setCreatedAt(task.getCreatedAt());
        // dto.setUpdatedAt(task.getUpdatedAt());

        return dto;
    }
}