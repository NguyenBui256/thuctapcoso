package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRoleRepository extends JpaRepository<ProjectRole, Integer> {
    List<ProjectRole> findByProject(Project project);
    Optional<ProjectRole> findByProjectAndRoleName(Project project, String roleName);
} 