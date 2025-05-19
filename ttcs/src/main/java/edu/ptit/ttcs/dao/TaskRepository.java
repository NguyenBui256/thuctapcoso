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

    // Override existing methods to respect soft delete
    @Query("SELECT t FROM Task t WHERE t.id = :id AND (t.isDeleted = false OR t.isDeleted IS NULL)")
    Optional<Task> findById(@Param("id") Integer id);

    @Query("SELECT t FROM Task t WHERE (t.isDeleted = false OR t.isDeleted IS NULL)")
    List<Task> findAll();

    // Add soft delete aware methods with better filtering
    @Query("SELECT t FROM Task t WHERE t.userStory = :userStory AND (t.isDeleted = false OR t.isDeleted IS NULL)")
    List<Task> findByUserStoryAndIsDeletedFalseOrIsDeletedIsNull(@Param("userStory") UserStory userStory);

    // Additional method to find by userStory ID directly
    @Query("SELECT t FROM Task t WHERE t.userStory.id = :userStoryId AND (t.isDeleted = false OR t.isDeleted IS NULL)")
    List<Task> findByUserStoryId(@Param("userStoryId") Integer userStoryId);

    // For backward compatibility
    default List<Task> findByUserStory(UserStory userStory) {
        if (userStory == null) {
            throw new IllegalArgumentException("UserStory parameter cannot be null");
        }
        if (userStory.getId() == null) {
            throw new IllegalArgumentException("UserStory ID cannot be null");
        }
        // Use the ID-based query for more reliable results
        return findByUserStoryId(userStory.getId());
    }

    /**
     * Find all tasks for user stories in a specific sprint
     * 
     * @param sprintId the id of the sprint
     * @return list of tasks
     */
    @Query("SELECT t FROM Task t JOIN t.userStory us WHERE us.sprint.id = :sprintId AND (t.isDeleted = false OR t.isDeleted IS NULL)")
    List<Task> findTasksBySprintId(@Param("sprintId") Long sprintId);

    @Query("SELECT t FROM Task t JOIN t.watchers w WHERE w.user.id = :userId AND (t.isDeleted = false OR t.isDeleted IS NULL)")
    List<Task> findTasksWatchedByUser(@Param("userId") Long userId);
}