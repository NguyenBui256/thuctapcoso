package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.*;
import edu.ptit.ttcs.entity.*;
import edu.ptit.ttcs.entity.dto.request.FilterParams;
import edu.ptit.ttcs.entity.dto.response.*;
import edu.ptit.ttcs.entity.enums.StatusType;
import edu.ptit.ttcs.exception.RequestException;
import edu.ptit.ttcs.specs.UserStorySpecs;
import edu.ptit.ttcs.util.ModelMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class UserStoryService {

    private final UserStoryRepository userStoryRepository;

    private final ProjectRepository projectRepository;

    private final SprintRepository sprintRepository;

    private final ProjectMemberRepository projectMemberRepository;

    private final PjSettingStatusRepository pjSettingStatusRepository;

    private final ProjectRoleRepository projectRoleRepository;

    private final UserRepository userRepository;

    public List<UserStoryDTO> get(long projectId,
            Long sprintId,
            FilterParams filters) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RequestException("Project not found"));
        if (sprintId != null && !sprintRepository.existsById(sprintId))
            throw new RequestException("Sprint not found");
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).get();
        if (!projectMemberRepository.existsByProjectAndUserAndIsDeleteFalse(project, user))
            throw new RequestException("Member not found");
        Specification<UserStory> spec = Specification.where(
                UserStorySpecs.belongToProject(projectId))
                .and(UserStorySpecs.isNotDeleted());
        if (sprintId != null) {
            spec = spec.and(UserStorySpecs.belongToSprint(sprintId));
        } else {
            spec = spec.and(UserStorySpecs.notBelongToSprint());
        }

        if (filters.getKeyword() != null) {
            spec = spec.and(UserStorySpecs.hasKeyword(filters.getKeyword()));
        }

        if (filters.getExcludeStatuses() != null) {
            spec = spec.and(UserStorySpecs.byStatuses(filters.getExcludeStatuses(), true));
        }
        if (filters.getExcludeCreatedBy() != null) {
            spec = spec.and(UserStorySpecs.byCreatedMembers(filters.getExcludeCreatedBy(), true));
        }
        if (filters.getExcludeAssigns() != null) {
            spec = spec.and(UserStorySpecs.byAssignedMembers(filters.getExcludeAssigns(), true));
        }
        if (filters.getExcludeRoles() != null) {
            spec = spec.and(UserStorySpecs.byMemberRoles(filters.getExcludeRoles(), true));
        }

        if (filters.getStatuses() != null) {
            spec = spec.and(UserStorySpecs.byStatuses(filters.getStatuses(), false));
        }
        if (filters.getCreatedBy() != null) {
            spec = spec.and(UserStorySpecs.byCreatedMembers(filters.getCreatedBy(), false));
        }
        if (filters.getAssigns() != null) {
            spec = spec.and(UserStorySpecs.byAssignedMembers(filters.getAssigns(), false));
        }
        if (filters.getRoles() != null) {
            spec = spec.and(UserStorySpecs.byMemberRoles(filters.getRoles(), false));
        }
        List<UserStory> res = userStoryRepository.findAll(spec);
        return res.stream().map(this::toDTO).toList();
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

        // Lấy danh sách user story chưa bị xóa để làm dữ liệu lọc
        Specification<UserStory> spec = Specification.where(
                UserStorySpecs.belongToProject(projectId))
                .and(UserStorySpecs.isNotDeleted());
        List<UserStory> activeUserStories = userStoryRepository.findAll(spec);

        List<ProjectMember> members = projectMemberRepository.findAllByProjectAndIsDeleteIsFalse(project);
        List<PjMemberDTO> memberDTOs = members.stream()
                .map(member -> {
                    PjMemberDTO dto = new PjMemberDTO();
                    dto.setId(member.getId());
                    dto.setFullName(member.getUser().getFullName());
                    dto.setAvatar(member.getUser().getAvatar());
                    return dto;
                })
                .toList();

        // Lấy danh sách trạng thái user_story cho project
        List<PjStatusDTO> statuses = pjSettingStatusRepository.findAllByProjectAndType(project, StatusType.USER_STORY)
                .stream()
                .map(status -> ModelMapper.getInstance().map(status, PjStatusDTO.class))
                .filter(dto -> statusFiltered.stream().noneMatch(st -> st == dto.getId()))
                .toList();

        // Nếu danh sách trạng thái rỗng, thử dùng các chuỗi type khác
        if (statuses.isEmpty()) {
            // Thử với "USERSTORY"
            statuses = pjSettingStatusRepository.findAllByProjectAndType(project, "USERSTORY")
                    .stream()
                    .map(status -> ModelMapper.getInstance().map(status, PjStatusDTO.class))
                    .filter(dto -> statusFiltered.stream().noneMatch(st -> st == dto.getId()))
                    .toList();

            // Nếu vẫn trống, thử với "USER_STORY" viết hoa
            if (statuses.isEmpty()) {
                statuses = pjSettingStatusRepository.findAllByProjectAndType(project, "USER_STORY")
                        .stream()
                        .map(status -> ModelMapper.getInstance().map(status, PjStatusDTO.class))
                        .filter(dto -> statusFiltered.stream().noneMatch(st -> st == dto.getId()))
                        .toList();
            }
        }

        // Log thông tin debug
        System.out.println("Filter data - Statuses count: " + statuses.size());
        if (!statuses.isEmpty()) {
            System.out.println("Status examples: " + statuses.get(0).getName());
        }

        List<PjRoleDTO> roles = projectRoleRepository.findAllByProject(project).stream()
                .map(role -> ModelMapper.getInstance().map(role, PjRoleDTO.class))
                .filter(dto -> roleFiltered.stream().noneMatch(r -> r == dto.getId()))
                .toList();

        return FilterData.builder()
                .assigns(memberDTOs.stream().filter(dto -> assignFiltered.stream().noneMatch(a -> a == dto.getId()))
                        .toList())
                .createdBy(memberDTOs.stream()
                        .filter(dto -> createdByFiltered.stream().noneMatch(a -> a == dto.getId())).toList())
                .statuses(statuses)
                .roles(roles)
                .build();
    }

    public UserStoryDTO toDTO(UserStory userStory) {
        UserStoryDTO dto = ModelMapper.getInstance().map(userStory, UserStoryDTO.class);
        PjStatusDTO statusDTO = ModelMapper.getInstance().map(userStory.getStatus(), PjStatusDTO.class);
        dto.setStatus(statusDTO);
        dto.setTasks(userStory.getTasks().stream()
                .map(task -> {
                    TaskDTO taskDTO = ModelMapper.getInstance().map(task, TaskDTO.class);
                    taskDTO.setStatus(ModelMapper.getInstance().map(task.getStatus(), PjStatusDTO.class));
                    taskDTO.setTags(task.getTags().stream()
                            .map(tag -> ModelMapper.getInstance().map(tag, PjTagDTO.class))
                            .toList());
                    return taskDTO;
                }).toList());
        return dto;
    }

    public UserStoryDTO updateSprint(long userStoryId, long sprintId) {
        UserStory userStory = userStoryRepository.findById((int) userStoryId)
                .orElseThrow(() -> new RequestException("User story not found"));

        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RequestException("Sprint not found"));

        // Ensure they belong to the same project
        if (!userStory.getProject().getId().equals(sprint.getProject().getId())) {
            throw new RequestException("User story and sprint must belong to the same project");
        }

        userStory.setSprint(sprint);
        userStory = userStoryRepository.save(userStory);

        return toDTO(userStory);
    }

    public UserStoryDTO removeSprint(long userStoryId) {
        UserStory userStory = userStoryRepository.findById((int) userStoryId)
                .orElseThrow(() -> new RequestException("User story not found"));

        userStory.setSprint(null);
        userStory = userStoryRepository.save(userStory);

        return toDTO(userStory);
    }

    /**
     * Cập nhật trạng thái cho UserStory
     * 
     * @param userStoryId ID của UserStory
     * @param statusId    ID của status từ bảng project_setting_status
     * @return UserStory đã được cập nhật
     */
    public UserStory updateUserStoryStatus(Integer userStoryId, Integer statusId) {
        UserStory userStory = userStoryRepository.findById(userStoryId)
                .orElseThrow(() -> new RequestException("User story not found"));

        // Tìm status từ bảng project_setting_status
        ProjectSettingStatus status = pjSettingStatusRepository.findById(statusId)
                .orElseThrow(() -> new RequestException("Status not found"));

        // Kiểm tra xem status có thuộc project của userStory không
        if (!status.getProject().getId().equals(userStory.getProject().getId())) {
            throw new RequestException("Status does not belong to this project");
        }

        // Kiểm tra xem status có đúng type là USERSTORY không
        if (!"USERSTORY".equals(status.getType())) {
            throw new RequestException("Invalid status type. Expected USERSTORY status type.");
        }

        // Cập nhật status
        userStory.setStatus(status);

        return userStoryRepository.save(userStory);
    }

    /**
     * Lấy tất cả các trạng thái có thể có của UserStory cho một dự án cụ thể
     * 
     * @param projectId ID của dự án
     * @return Danh sách các trạng thái UserStory
     */
    public List<PjStatusDTO> getUserStoryStatuses(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RequestException("Project not found"));

        // Lấy các trạng thái có type là USERSTORY từ bảng project_setting_status
        List<ProjectSettingStatus> statuses = pjSettingStatusRepository
                .findAllByProjectAndType(project, "USERSTORY");

        return statuses.stream()
                .map(status -> ModelMapper.getInstance().map(status, PjStatusDTO.class))
                .toList();
    }

    public List<UserStory> getAllByProject(Project project) {
        return userStoryRepository.findAllByProject(project);
    }
}
