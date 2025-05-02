package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Issue;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectSettingStatus;
import edu.ptit.ttcs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {
    @Query("SELECT i FROM Issue i WHERE i.sprint.project = :project")
    List<Issue> findByProject(@Param("project") Project project);

    @Query("SELECT i FROM Issue i WHERE i.sprint.project = :project AND i.status = :status")
    List<Issue> findByProjectAndStatus(@Param("project") Project project, @Param("status") ProjectSettingStatus status);

    List<Issue> findByProjectId(Long projectId);

    List<Issue> findBySubjectContaining(String keyword);

    @Query("SELECT MAX(i.position) FROM Issue i WHERE i.status.id = :statusId")
    Integer findMaxPositionByStatusId(@Param("statusId") Long statusId);

    @Modifying
    @Query("UPDATE Issue i SET i.position = i.position + 1 WHERE i.status.id = :statusId")
    void incrementPositionsByStatusId(@Param("statusId") Long statusId);

    Optional<Issue> findLastByProject(Project project);
}