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
        if(sprintId != null && !sprintRepository.existsById(sprintId))
            throw new RequestException("Sprint not found");
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).get();
        if(!projectMemberRepository.existsByProjectAndUserAndIsDeleteFalse(project, user))
            throw new RequestException("Member not found");
        Specification<UserStory> spec = Specification.where(
                UserStorySpecs.belongToProject(projectId)
        );
        if(sprintId != null){
            spec = spec.and(UserStorySpecs.belongToSprint(sprintId));
        }
        else{
            spec = spec.and(UserStorySpecs.notBelongToSprint());
        }

        if(filters.getKeyword() != null){
            spec = spec.and(UserStorySpecs.hasKeyword(filters.getKeyword()));
        }

        if(filters.getExcludeStatuses() != null){
            spec = spec.and(UserStorySpecs.byStatuses(filters.getExcludeStatuses(), true));
        }
        if(filters.getExcludeCreatedBy() != null){
            spec = spec.and(UserStorySpecs.byCreatedMembers(filters.getExcludeCreatedBy(), true));
        }
        if(filters.getExcludeAssigns() != null){
            spec = spec.and(UserStorySpecs.byAssignedMembers(filters.getExcludeAssigns(), true));
        }
        if(filters.getExcludeRoles() != null){
            spec = spec.and(UserStorySpecs.byMemberRoles(filters.getExcludeRoles(), true));
        }

        if(filters.getStatuses() != null){
            spec = spec.and(UserStorySpecs.byStatuses(filters.getStatuses(), false));
        }
        if(filters.getCreatedBy() != null){
            spec = spec.and(UserStorySpecs.byCreatedMembers(filters.getCreatedBy(), false));
        }
        if(filters.getAssigns() != null){
            spec = spec.and(UserStorySpecs.byAssignedMembers(filters.getAssigns(), false));
        }
        if(filters.getRoles() != null){
            spec = spec.and(UserStorySpecs.byMemberRoles(filters.getRoles(), false));
        }
        List<UserStory> res = userStoryRepository.findAll(spec);
        return res.stream().map(this::toDTO).toList();
    }

    public FilterData getFilterData(long projectId,
                                    FilterParams filters){
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


        List<ProjectMember> members = projectMemberRepository.findAllByProject(project);
        List<PjMemberDTO> memberDTOS = members.stream()
                .map(member -> {
                    PjMemberDTO dto = new PjMemberDTO();
                    dto.setId(member.getId());
                    dto.setFullName(member.getUser().getFullName());
                    dto.setAvatar(member.getUser().getAvatar());
                    return dto;
                })
                .toList();
        List<PjStatusDTO> statuses = pjSettingStatusRepository.findAllByProjectAndType(project, StatusType.USER_STORY).stream()
                .map(status -> ModelMapper.getInstance().map(status, PjStatusDTO.class))
                .filter(dto -> statusFiltered.stream().noneMatch(st -> st == dto.getId()))
                .toList();
        List<PjRoleDTO> roles = projectRoleRepository.findAllByProject(project).stream()
                .map(role -> ModelMapper.getInstance().map(role, PjRoleDTO.class))
                .filter(dto -> roleFiltered.stream().noneMatch(r -> r == dto.getId()))
                .toList();
        return FilterData.builder()
                .assignedTo(memberDTOS.stream().filter(dto ->
                        assignFiltered.stream().noneMatch(a -> a == dto.getId())).toList())
                .createdBy(memberDTOS.stream().filter(dto ->
                        createdByFiltered.stream().noneMatch(a -> a == dto.getId())).toList())
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

}
