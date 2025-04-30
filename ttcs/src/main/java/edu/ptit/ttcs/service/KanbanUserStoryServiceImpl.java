package edu.ptit.ttcs.service;

import edu.ptit.ttcs.entity.dto.UserStoryDTO;
import edu.ptit.ttcs.entity.dto.TaskDTO;
import edu.ptit.ttcs.entity.dto.CommentDTO;
import edu.ptit.ttcs.entity.dto.ActivityDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KanbanUserStoryServiceImpl implements KanbanUserStoryService {
    @Override
    public UserStoryDTO getUserStoryById(Integer id) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public UserStoryDTO updateUserStory(Integer id, UserStoryDTO update) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public TaskDTO addSubTask(Integer id, TaskDTO subTask) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public CommentDTO addComment(Integer id, CommentDTO comment) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public List<ActivityDTO> getActivities(Integer id) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public void addWatcher(Integer id, Integer userId) {
        throw new UnsupportedOperationException("Not implemented");
    }
}