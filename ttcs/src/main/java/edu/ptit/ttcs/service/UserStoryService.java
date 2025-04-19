package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.dao.SprintRepository;
import edu.ptit.ttcs.dao.UserStoryRepository;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.Sprint;
import edu.ptit.ttcs.entity.UserStory;
import edu.ptit.ttcs.entity.dto.response.UserStoryDTO;
import edu.ptit.ttcs.exception.RequestException;
import edu.ptit.ttcs.util.ModelMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserStoryService {

    private final UserStoryRepository userStoryRepository;

    private final ProjectRepository projectRepository;

    private final SprintRepository sprintRepository;

    public List<UserStoryDTO> get(long projectId, Long sprintId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RequestException("Project not found"));
        Sprint sprint = null;
        if(sprintId != null){
            sprint = sprintRepository.findById(sprintId)
                    .orElseThrow(() -> new RequestException("Sprint not found"));
        }
        return userStoryRepository.findAllByProjectAndSprint(project, sprint)
                .stream().map(this::toDTO).toList();
    }

    public UserStoryDTO toDTO(UserStory userStory) {
        UserStoryDTO dto = ModelMapper.getInstance().map(userStory, UserStoryDTO.class);
        return dto;
    }

}
