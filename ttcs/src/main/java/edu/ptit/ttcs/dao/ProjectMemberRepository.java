package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProject(Project project);
    List<ProjectMember> findByUser(User user);
    List<ProjectMember> findByProjectRole(ProjectRole projectRole);
    List<ProjectMember> findByIsAdmin(Boolean isAdmin);
    List<ProjectMember> findByIsDelete(Boolean isDelete);
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
} 