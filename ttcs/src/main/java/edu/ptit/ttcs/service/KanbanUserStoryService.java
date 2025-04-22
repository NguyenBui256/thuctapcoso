package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dto.UserStoryDTO;
import edu.ptit.ttcs.dto.TaskDTO;
import edu.ptit.ttcs.dto.CommentDTO;
import edu.ptit.ttcs.dto.ActivityDTO;

import java.util.List;

public interface KanbanUserStoryService {
    UserStoryDTO getUserStoryById(Integer id);

    UserStoryDTO updateUserStory(Integer id, UserStoryDTO update);

    TaskDTO addSubTask(Integer id, TaskDTO subTask);

    CommentDTO addComment(Integer id, CommentDTO comment);

    List<ActivityDTO> getActivities(Integer id);

    void addWatcher(Integer id, Integer userId);
}