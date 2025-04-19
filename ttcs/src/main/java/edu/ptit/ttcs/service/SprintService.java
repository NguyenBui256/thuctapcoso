package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.*;
import edu.ptit.ttcs.entity.*;
import edu.ptit.ttcs.entity.dto.request.CreateSprintDTO;
import edu.ptit.ttcs.entity.dto.response.SprintDTO;
import edu.ptit.ttcs.exception.RequestException;
import edu.ptit.ttcs.util.ModelMapper;
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

    private final ProjectRepository projectRepository;

    private final UserStoryRepository userStoryRepository;

    private final UserRepository userRepository;

    private final ProjectMemberRepository projectMemberRepository;

    public List<SprintDTO> getAllByProject(long projectId, boolean close) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RequestException("Project not found"));
        List<Sprint> sprints = sprintRepository.findAllByProject(project);
        return sprints.stream()
                .filter(sprint -> {
                    for(UserStory us : sprint.getUserStories()) {
                        if(us.getStatus().getClosed() != close) return false;
                    }
                    return true;
                })
                .map(this::toSprintDTO)
                .toList();
    }

    @Transactional
    public SprintDTO createSprint(@Valid CreateSprintDTO dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RequestException("Project not found"));
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).get();
        ProjectMember member = projectMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new RequestException("Member's not in this project"));
        Sprint sprint = ModelMapper.getInstance().map(dto, Sprint.class);
        sprint.setCreatedDate(LocalDateTime.now());
        sprint.setProject(project);
        sprint.setCreatedBy(member);
        return toSprintDTO(sprintRepository.save(sprint));
    }

    public SprintDTO toSprintDTO(Sprint sprint) {
        SprintDTO dto = ModelMapper.getInstance().map(sprint, SprintDTO.class);
        dto.setUserStories(sprint.getUserStories().stream()
                .map(userStoryService::toDTO)
                .toList());
        return dto;
    }

}
