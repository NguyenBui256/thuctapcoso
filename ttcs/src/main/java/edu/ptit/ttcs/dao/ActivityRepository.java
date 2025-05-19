package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Activity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByProjectIdOrderByTimestampDesc(Long projectId);

    List<Activity> findByIssueIdOrderByTimestampDesc(Long issueId);

    List<Activity> findByUserStoryIdOrderByTimestampDesc(Integer userStoryId);

    @Query("SELECT a FROM Activity a WHERE a.task.id = :taskId ORDER BY a.timestamp DESC")
    List<Activity> findByTaskIdOrderByTimestampDesc(@Param("taskId") Integer taskId);

    Page<Activity> findByProjectIdOrderByTimestampDesc(Long projectId, Pageable pageable);
}