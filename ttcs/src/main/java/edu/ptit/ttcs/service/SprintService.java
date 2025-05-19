package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.*;
import edu.ptit.ttcs.entity.*;
import edu.ptit.ttcs.entity.dto.request.SaveSprintDTO;
import edu.ptit.ttcs.entity.dto.response.SprintDTO;
import edu.ptit.ttcs.entity.dto.response.SprintProgressDTO;
import edu.ptit.ttcs.exception.RequestException;
import edu.ptit.ttcs.util.ModelMapper;
import edu.ptit.ttcs.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final UserStoryService userStoryService;

    private final SprintRepository sprintRepository;

    private final TaskRepository taskRepository;

    private final ProjectService projectService;

    private final UserStoryRepository userStoryRepository;

    private final UserRepository userRepository;

    private final ProjectMemberServiceT projectMemberService;

    private final SecurityUtils securityUtils;

    public List<SprintDTO> getAllByProject(long projectId, boolean close) {
        Project project = projectService.findById(projectId);
        List<Sprint> sprints = sprintRepository.findAllByProject(project);
        return sprints.stream()
                .filter(sprint -> {
                    if (sprint.getUserStories().isEmpty() == close)
                        return true;
                    return sprint.getUserStories().stream()
                            .filter(us -> us.getIsDeleted() == null || !us.getIsDeleted())
                            .noneMatch(us -> us.getStatus().getClosed() != close);
                })
                .map(this::toSprintDTO)
                .toList();
    }

    @Transactional
    public SprintDTO createSprint(@Valid SaveSprintDTO dto) {
        if (dto.getStartDate().isAfter(dto.getEndDate()))
            throw new RequestException("Start date cannot be after end date");
        Project project = projectService.findById(dto.getProjectId());
        List<Sprint> allSprints = sprintRepository.findAllByProject(project);
        boolean duplicateName = allSprints.stream().anyMatch(sp -> sp.getName().equals(dto.getName()));
        if (duplicateName) {
            throw new RequestException("Sprint name already exists");
        }
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).get();
        ProjectMember member = projectMemberService.getByProjectAndUser(project, user);
        Sprint sprint = new Sprint();
        sprint.setName(dto.getName());
        sprint.setStartDate(dto.getStartDate());
        sprint.setEndDate(dto.getEndDate());
        sprint.setCreatedDate(LocalDateTime.now());
        sprint.setProject(project);
        sprint.setCreatedBy(member);
        sprint.setStatus(Sprint.OPEN);
        return toSprintDTO(sprintRepository.save(sprint));
    }

    @Transactional
    public SprintDTO update(int sprintId, @Valid SaveSprintDTO dto) {
        if (dto.getStartDate().isAfter(dto.getEndDate()))
            throw new RequestException("Start date cannot be after end date");
        Sprint sprint = sprintRepository.findById((long) sprintId)
                .orElseThrow(() -> new RequestException("Sprint not found"));
        if (sprint.getProject().getId() != dto.getProjectId())
            throw new RequestException("Sprint is not in this project");
        List<Sprint> allSprints = sprintRepository.findAllByProject(sprint.getProject());
        boolean duplicateName = allSprints.stream()
                .anyMatch(sp -> sp.getId() != sprintId && sp.getName().equals(dto.getName()));
        if (duplicateName) {
            throw new RequestException("Sprint name already exists");
        }
        sprint.setName(dto.getName());
        sprint.setStartDate(dto.getStartDate());
        sprint.setEndDate(dto.getEndDate());
        sprint.setUpdatedDate(LocalDateTime.now());
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).get();
        ProjectMember member = projectMemberService.getByProjectAndUser(sprint.getProject(), user);
        sprint.setUpdatedBy(member);
        return toSprintDTO(sprintRepository.save(sprint));
    }

    @Transactional
    public void delete(int sprintId, long projectId) {
        Sprint sprint = sprintRepository.findById((long) sprintId)
                .orElseThrow(() -> new RequestException("Sprint not found"));
        if (sprint.getProject().getId() != projectId)
            throw new RequestException("Sprint is not in this project");
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).get();
        projectMemberService.getByProjectAndUser(sprint.getProject(), user);
        sprintRepository.delete(sprint);
    }

    public SprintDTO toSprintDTO(Sprint sprint) {
        SprintDTO dto = ModelMapper.getInstance().map(sprint, SprintDTO.class);

        // Lọc các user story chưa bị xóa
        List<UserStory> activeUserStories = sprint.getUserStories().stream()
                .filter(us -> us.getIsDeleted() == null || !us.getIsDeleted())
                .toList();

        dto.setUserStories(activeUserStories.stream()
                .map(userStoryService::toDTO)
                .toList());
        dto.setTotal(activeUserStories.size());
        dto.setClosed((int) activeUserStories.stream()
                .filter(us -> us.getStatus().getClosed())
                .count());
        return dto;
    }

    public SprintProgressDTO getProgress(long projectId) {
        Project project = projectService.findById(projectId);
        User user = securityUtils.getCurrentUser();
        projectMemberService.getByProjectAndUser(project, user);
        List<UserStory> allSt = userStoryService.getAllByProject(project);
        int spCnt = sprintRepository.countByProject(project);
        int totalTasks = allSt.stream()
                .reduce(0, (a, b) -> a + b.getTasks().size(), Integer::sum);
        int completedTasks = allSt.stream()
                .reduce(0, (a, b) -> {
                    return a + (int)(b.getTasks().stream()
                            .filter(t -> t.getStatus().getClosed())
                            .count());
                }, Integer::sum);
        return SprintProgressDTO.builder()
                .totalSprints(spCnt)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .averageTaskPerSprint(1.0 * totalTasks / spCnt)
                .build();
    }
}
