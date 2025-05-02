package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProjectAndIsDeleteFalse(Project project);

    List<ProjectMember> findByUserAndIsDeleteFalse(User user);

    List<ProjectMember> findByProjectIdAndIsDeleteFalse(Long projectId);

    @Query("SELECT pm FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.id = :userId AND pm.isDelete = false")
    ProjectMember findByProjectIdAndUserIdAndIsDeleteFalse(@Param("projectId") Long projectId,
            @Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(pm) > 0 THEN true ELSE false END FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.id = :userId AND pm.isDelete = false")
    boolean existsByProjectIdAndUserIdAndIsDeleteFalse(@Param("projectId") Long projectId,
            @Param("userId") Long userId);

    ProjectMember findByProjectAndUser(Project project, User user);
    boolean existsByProjectAndUserAndIsDeleteFalse(Project project, User user);

    Optional<ProjectMember> findByIdAndIsDeleteIsFalse(long id);

    Optional<ProjectMember> findByUserAndProject(User user, Project project);

    List<ProjectMember> findAllByProjectAndIsDeleteIsFalse(Project project);
}