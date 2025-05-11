package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedBy(User owner);

    Optional<Project> findById(Long id);

    Page<Project> findByIsDeletedFalse(Pageable pageable);

    Page<Project> findByIsPublicTrueAndIsDeletedFalse(Pageable pageable);

    List<Project> findByIsDeletedFalse();

    @Query("SELECT DISTINCT p FROM Project p JOIN p.projectMembers pm JOIN pm.user u WHERE u.id = :userId")
    List<Project> findByUserJoined(@Param("userId") Long userId);

    @Query("SELECT DISTINCT p FROM Project p WHERE p.id IN " +
            "(SELECT DISTINCT us.project.id FROM UserStory us JOIN us.assignedUsers pm JOIN pm.user u WHERE u.id = :userId) "
            +
            "OR p.id IN " +
            "(SELECT DISTINCT t.project.id FROM Task t JOIN t.assignees pm JOIN pm.user u WHERE u.id = :userId)")
    List<Project> findByUserAssigned(@Param("userId") Long userId);

    @Query("SELECT DISTINCT p FROM Project p WHERE p.id IN " +
            "(SELECT DISTINCT us.project.id FROM UserStory us JOIN us.watchers pm JOIN pm.user u WHERE u.id = :userId) "
            +
            "OR p.id IN " +
            "(SELECT DISTINCT t.project.id FROM Task t JOIN t.watchers pm JOIN pm.user u WHERE u.id = :userId)")
    List<Project> findByUserWatching(@Param("userId") Long userId);
}