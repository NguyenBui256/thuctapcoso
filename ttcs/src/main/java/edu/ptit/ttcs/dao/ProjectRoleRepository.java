package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.dto.response.PjRoleDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRoleRepository extends JpaRepository<ProjectRole, Long> {
    List<ProjectRole> findByProjectId(Long projectId);

    List<ProjectRole> findAllByProject(Project project);

    /**
     * Find project role by project and role name
     * 
     * @param project  the project
     * @param roleName the role name
     * @return the project role
     */
    @Query("SELECT pr FROM ProjectRole pr WHERE pr.project = :project AND pr.roleName = :roleName")
    Optional<ProjectRole> findByProjectAndRoleName(@Param("project") Project project,
            @Param("roleName") String roleName);
}