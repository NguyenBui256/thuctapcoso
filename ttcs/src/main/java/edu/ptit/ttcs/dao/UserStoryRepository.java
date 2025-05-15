package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.Task;
import edu.ptit.ttcs.entity.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserStoryRepository extends JpaRepository<UserStory, Integer>, JpaSpecificationExecutor<UserStory> {
    // Override basic methods to respect soft delete
    @Query("SELECT us FROM UserStory us WHERE us.id = :id AND (us.isDeleted = false OR us.isDeleted IS NULL)")
    Optional<UserStory> findById(@Param("id") Integer id);

    @Query("SELECT us FROM UserStory us WHERE (us.isDeleted = false OR us.isDeleted IS NULL)")
    List<UserStory> findAll();

    // Update existing methods to respect soft delete
    @Query("SELECT us FROM UserStory us WHERE us.status.id = :statusId AND (us.isDeleted = false OR us.isDeleted IS NULL)")
    List<UserStory> findByStatusId(@Param("statusId") Integer statusId);

    @Query("SELECT t FROM Task t WHERE t.userStory.id = :userStoryId AND (t.isDeleted = false OR t.isDeleted IS NULL)")
    List<Task> findTasksByUserStoryId(@Param("userStoryId") Integer userStoryId);

    @Query("SELECT us FROM UserStory us WHERE us.project.id = :projectId AND (us.isDeleted = false OR us.isDeleted IS NULL)")
    List<UserStory> findByProjectId(@Param("projectId") Long projectId);

    /**
     * Find all user stories in a specific sprint
     * 
     * @param sprintId the id of the sprint
     * @return list of user stories
     */
    @Query("SELECT us FROM UserStory us WHERE us.sprint.id = :sprintId AND (us.isDeleted = false OR us.isDeleted IS NULL)")
    List<UserStory> findBySprintId(@Param("sprintId") Long sprintId);

    List<UserStory> findAllByProject(Project project);
}