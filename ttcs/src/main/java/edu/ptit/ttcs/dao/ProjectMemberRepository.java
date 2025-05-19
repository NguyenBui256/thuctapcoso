package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
        List<ProjectMember> findByProject(Project project);

        List<ProjectMember> findByUserAndIsDeleteIsFalse(User user);

        Optional<ProjectMember> findByProjectAndUser(Project project, User user);

        @Query(nativeQuery = true, value = "SELECT * FROM project_member WHERE project_id = ?1 AND user_id = ?2 ORDER BY id DESC LIMIT 1")
        Optional<ProjectMember> findLastByProjectAndUser(Long projectId, Long userId);

        List<ProjectMember> findByProjectAndIsDeleteFalse(Project project);

        @Query("SELECT pm FROM ProjectMember pm WHERE pm.user.id = :userId AND pm.isDelete = false")
        List<ProjectMember> findByUserIdAndIsDeleteFalse(@Param("userId") Long userId);

        List<ProjectMember> findByProjectIdAndIsDeleteFalse(Long projectId);

        @Query("SELECT pm FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.id = :userId AND pm.isDelete = false")
        ProjectMember findByProjectIdAndUserIdAndIsDeleteFalse(@Param("projectId") Long projectId,
                        @Param("userId") Long userId);

        @Query("SELECT CASE WHEN COUNT(pm) > 0 THEN true ELSE false END FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.id = :userId AND pm.isDelete = false")
        boolean existsByProjectIdAndUserIdAndIsDeleteFalse(@Param("projectId") Long projectId,
                        @Param("userId") Long userId);

        boolean existsByProjectAndUserAndIsDeleteFalse(Project project, User user);

        Optional<ProjectMember> findByIdAndIsDeleteIsFalse(long id);

        List<ProjectMember> findByProjectAndIsAdminTrueAndIsDeleteFalse(Project project);

        Optional<ProjectMember> findByUserAndProject(User user, Project project);

        List<ProjectMember> findAllByProjectAndIsDeleteIsFalse(Project project);

        /**
         * Find project members by project and project role
         * 
         * @param project     the project
         * @param projectRole the project role
         * @return list of project members
         */
        @Query("SELECT pm FROM ProjectMember pm WHERE pm.project = :project AND pm.projectRole = :projectRole AND pm.isDelete = false")
        List<ProjectMember> findByProjectAndProjectRole(@Param("project") Project project,
                        @Param("projectRole") ProjectRole projectRole);

        /**
         * Find project members by project and admin status
         * 
         * @param project the project
         * @param isAdmin the admin status
         * @return list of project members
         */
        @Query("SELECT pm FROM ProjectMember pm WHERE pm.project = :project AND pm.isAdmin = :isAdmin AND pm.isDelete = false")
        List<ProjectMember> findByProjectAndIsAdmin(@Param("project") Project project,
                        @Param("isAdmin") boolean isAdmin);

        @Query("SELECT DISTINCT pm2.user FROM ProjectMember pm1 JOIN ProjectMember pm2 ON pm1.project = pm2.project WHERE pm1.user.id = :userId AND pm2.user.id <> :userId AND pm1.isDelete = false AND pm2.isDelete = false")
        List<User> findContactsByUserId(@Param("userId") Long userId);
}