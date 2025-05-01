package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Task;
import edu.ptit.ttcs.entity.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserStoryRepository extends JpaRepository<UserStory, Integer>, JpaSpecificationExecutor<UserStory> {
    List<UserStory> findByStatusId(Integer statusId);

    @Query("SELECT t FROM Task t WHERE t.userStory.id = :userStoryId")
    List<Task> findTasksByUserStoryId(@Param("userStoryId") Integer userStoryId);

    List<UserStory> findByProjectId(Long projectId);
}