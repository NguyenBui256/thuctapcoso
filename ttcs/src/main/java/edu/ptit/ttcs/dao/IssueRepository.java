package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Issue;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectSettingStatus;
import edu.ptit.ttcs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    @Query("SELECT i FROM Issue i WHERE i.sprint.project = :project")
    List<Issue> findByProject(@Param("project") Project project);

    @Query("SELECT i FROM Issue i WHERE i.sprint.project = :project AND i.status = :status")
    List<Issue> findByProjectAndStatus(@Param("project") Project project, @Param("status") ProjectSettingStatus status);

    List<Issue> findByAssignee(User user);

    List<Issue> findByWatchersContaining(User user);

    List<Issue> findByProjectId(Long projectId);

    long countByStatusId(Long statusId);

    List<Issue> findBySubjectContaining(String keyword);

    @Query("SELECT MAX(i.position) FROM Issue i WHERE i.status.id = :statusId")
    Integer findMaxPositionByStatusId(@Param("statusId") Long statusId);

    @Modifying
    @Query("UPDATE Issue i SET i.position = i.position + 1 WHERE i.status.id = :statusId")
    void incrementPositionsByStatusId(@Param("statusId") Long statusId);
}