package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByProjectIdOrderByTimestampDesc(Long projectId);

    List<Activity> findByIssueIdOrderByTimestampDesc(Long issueId);

    List<Activity> findByUserStoryIdOrderByTimestampDesc(Integer userStoryId);

    List<Activity> findByTaskIdOrderByTimestampDesc(Integer taskId);
}