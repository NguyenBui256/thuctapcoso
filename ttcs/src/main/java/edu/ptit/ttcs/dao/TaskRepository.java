package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Task;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer>, JpaSpecificationExecutor<Task> {

    List<Task> findByUserStory(UserStory userStory);

    /**
     * Find all tasks for user stories in a specific sprint
     * 
     * @param sprintId the id of the sprint
     * @return list of tasks
     */
    @Query("SELECT t FROM Task t JOIN t.userStory us WHERE us.sprint.id = :sprintId")
    List<Task> findTasksBySprintId(@Param("sprintId") Long sprintId);
}