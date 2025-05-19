package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.*;
import edu.ptit.ttcs.entity.*;
import edu.ptit.ttcs.entity.dto.ProjectMemberDTO;
import edu.ptit.ttcs.entity.dto.request.FilterParams;
import edu.ptit.ttcs.entity.dto.response.*;
import edu.ptit.ttcs.entity.enums.StatusType;
import edu.ptit.ttcs.exception.RequestException;
import edu.ptit.ttcs.specs.TaskSpecs;
import edu.ptit.ttcs.util.ModelMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final UserStoryRepository userStoryRepository;

    private final PjSettingStatusRepository settingStatusRepository;

    private final TaskRepository taskRepository;

    private final ProjectRepository projectRepository;

    private final SprintRepository sprintRepository;

    private final ProjectMemberRepository projectMemberRepository;

    private final PjSettingStatusRepository pjSettingStatusRepository;

    private final ProjectRoleRepository projectRoleRepository;

    public List<TaskDTO> getBySprint(long projectId,
            long sprintId,
            FilterParams filters) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RequestException("Project not found"));
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RequestException("Sprint not found"));
        if (sprint.getProject().getId() != projectId) {
            throw new RequestException("Sprint is not in this project");
        }
        Specification<Task> spec = Specification.where(
                TaskSpecs.belongToSprint(sprintId));
        if (filters.getKeyword() != null) {
            spec = spec.and(TaskSpecs.hasKeyword(filters.getKeyword()));
        }
        if (filters.getExcludeStatuses() != null) {
            spec = spec.and(TaskSpecs.byStatuses(filters.getExcludeStatuses(), true));
        }
        if (filters.getExcludeCreatedBy() != null) {
            spec = spec.and(TaskSpecs.byCreatedMembers(filters.getExcludeCreatedBy(), true));
        }
        if (filters.getExcludeAssigns() != null) {
            spec = spec.and(TaskSpecs.byAssignedMembers(filters.getExcludeAssigns(), true));
        }
        if (filters.getExcludeRoles() != null) {
            spec = spec.and(TaskSpecs.byMemberRoles(filters.getExcludeRoles(), true));
        }

        if (filters.getStatuses() != null) {
            spec = spec.and(TaskSpecs.byStatuses(filters.getStatuses(), false));
        }
        if (filters.getCreatedBy() != null) {
            spec = spec.and(TaskSpecs.byCreatedMembers(filters.getCreatedBy(), false));
        }
        if (filters.getAssigns() != null) {
            spec = spec.and(TaskSpecs.byAssignedMembers(filters.getAssigns(), false));
        }
        if (filters.getRoles() != null) {
            spec = spec.and(TaskSpecs.byMemberRoles(filters.getRoles(), false));
        }
        List<Task> res = taskRepository.findAll(spec);
        return res.stream().map(this::toDTO).toList();
    }

    public TaskDTO toDTO(Task task) {
        TaskDTO dto = ModelMapper.getInstance().map(task, TaskDTO.class);
        dto.setUserStoryId(task.getUserStory().getId());
        dto.setStatus(ModelMapper.getInstance().map(task.getStatus(), PjStatusDTO.class));
        dto.setTags(task.getTags().stream()
                .map(tag -> ModelMapper.getInstance().map(tag, PjTagDTO.class))
                .toList());
        dto.setAssigned(mapToDTO(task.getAssigned()));
        return dto;
    }

    public void updateStatus(int taskId, int statusId, int userStoryId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RequestException("Task not found"));
        UserStory userStory = userStoryRepository.findById(userStoryId)
                .orElseThrow(() -> new RequestException("User story not found"));
        if (!task.getUserStory().getProject().getId().equals(userStory.getProject().getId()))
            throw new RequestException("User story doesn't belong to this project");
        task.setUserStory(userStory);
        if (task.getStatus() == null || task.getStatus().getId() != statusId) {
            ProjectSettingStatus status = settingStatusRepository.findById(statusId)
                    .orElseThrow(() -> new RequestException("Status not found"));

            // Kiểm tra xem status có đúng kiểu là TASK không
            if (!StatusType.TASK.toString().equals(status.getType())) {
                throw new RequestException("Invalid status type. Expected TASK status type.");
            }

            task.setStatus(status);
        }
        taskRepository.save(task);
    }

    /**
     * Lấy tất cả các trạng thái có thể có của task cho một dự án cụ thể
     * 
     * @param projectId ID của dự án
     * @return Danh sách các trạng thái task
     */
    public List<PjStatusDTO> getTaskStatuses(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RequestException("Project not found"));

        // Lấy các trạng thái có type là TASK từ bảng project_setting_status
        List<ProjectSettingStatus> statuses = pjSettingStatusRepository
                .findAllByProjectAndType(project, StatusType.TASK.toString());

        return statuses.stream()
                .map(status -> ModelMapper.getInstance().map(status, PjStatusDTO.class))
                .toList();
    }

    private ProjectMemberDTO mapToDTO(ProjectMember member) {
        if (member == null)
            return null;
        ProjectMemberDTO dto = new ProjectMemberDTO();
        dto.setId(member.getId());
        dto.setProjectId(member.getProject() != null ? member.getProject().getId() : null);
        dto.setUserId(member.getUser() != null ? Long.valueOf(member.getUser().getId()) : null);
        dto.setUsername(member.getUser() != null ? member.getUser().getUsername() : null);
        dto.setUserFullName(member.getUser() != null ? member.getUser().getFullName() : null);
        dto.setProjectRoleId(member.getProjectRole() != null ? member.getProjectRole().getId() : null);
        dto.setRoleName(member.getProjectRole() != null ? member.getProjectRole().getRoleName() : null);
        dto.setTotalPoint(member.getTotalPoint());
        dto.setIsAdmin(member.getIsAdmin());
        dto.setJoinedAt(member.getCreatedAt());
        dto.setAvatar(member.getUser().getAvatar());
        return dto;
    }

    public FilterData getFilterData(long projectId,
            FilterParams filters) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RequestException("Project not found"));

        List<Long> assignFiltered = Stream.of(filters.getAssigns(), filters.getExcludeAssigns())
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();

        List<Long> statusFiltered = Stream.of(filters.getStatuses(), filters.getExcludeStatuses())
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();

        List<Long> createdByFiltered = Stream.of(filters.getCreatedBy(), filters.getExcludeCreatedBy())
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();

        List<Long> roleFiltered = Stream.of(filters.getRoles(), filters.getExcludeRoles())
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();

        List<ProjectMember> members = projectMemberRepository.findAllByProjectAndIsDeleteIsFalse(project);
        List<PjMemberDTO> memberDTOS = members.stream()
                .map(member -> {
                    PjMemberDTO dto = new PjMemberDTO();
                    dto.setId(member.getId());
                    dto.setFullName(member.getUser().getFullName());
                    dto.setAvatar(member.getUser().getAvatar());
                    return dto;
                })
                .toList();
        List<PjStatusDTO> statuses = pjSettingStatusRepository
                .findAllByProjectAndType(project, StatusType.TASK.toString()).stream()
                .map(status -> ModelMapper.getInstance().map(status, PjStatusDTO.class))
                .filter(dto -> statusFiltered.stream().noneMatch(st -> st == dto.getId()))
                .toList();
        List<PjRoleDTO> roles = projectRoleRepository.findAllByProject(project).stream()
                .map(role -> ModelMapper.getInstance().map(role, PjRoleDTO.class))
                .filter(dto -> roleFiltered.stream().noneMatch(r -> r == dto.getId()))
                .toList();
        return FilterData.builder()
                .assigns(memberDTOS.stream().filter(dto -> assignFiltered.stream().noneMatch(a -> a == dto.getId()))
                        .toList())
                .createdBy(memberDTOS.stream()
                        .filter(dto -> createdByFiltered.stream().noneMatch(a -> a == dto.getId())).toList())
                .statuses(statuses)
                .roles(roles)
                .build();
    }
}
