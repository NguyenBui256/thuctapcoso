package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Integer> {
    List<ProjectMember> findByProject(Project project);

    List<ProjectMember> findByUserAndIsDeleteIsFalse(User user);

    Optional<ProjectMember> findByProjectAndUser(Project project, User user);

    @Query(nativeQuery = true, value = "SELECT * FROM project_member WHERE project_id = ?1 AND user_id = ?2 ORDER BY id DESC LIMIT 1")
    Optional<ProjectMember> findLastByProjectAndUser(Long projectId, Long userId);


    List<ProjectMember> findByProjectAndIsDeleteFalse(Project project);

    boolean existsByProjectAndUserAndIsDeleteFalse(Project project, User user);

    List<ProjectMember> findByProjectAndIsAdminTrueAndIsDeleteFalse(Project project);
}