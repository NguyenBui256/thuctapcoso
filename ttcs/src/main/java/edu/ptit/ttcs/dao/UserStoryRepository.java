package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.Sprint;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.UserStory;
import edu.ptit.ttcs.entity.dto.response.UserStoryDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserStoryRepository extends JpaRepository<UserStory, Integer> {
    List<UserStory> findBySprint(Sprint sprint);

    List<UserStory> findByAssignedUsersContaining(User user);

    List<UserStory> findByWatchersContaining(User user);

    List<UserStory> findByIsBlockTrue();

    List<UserStory> findAllByProjectAndSprint(Project project, Sprint sprint);
}