package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.dto.response.PjRoleDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRoleRepository extends JpaRepository<ProjectRole, Long> {
    List<ProjectRole> findByProjectId(Long projectId);

    List<ProjectRole> findAllByProject(Project project);
}