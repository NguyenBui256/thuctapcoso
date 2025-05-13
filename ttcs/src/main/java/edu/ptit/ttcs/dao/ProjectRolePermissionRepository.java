package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Permission;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.ProjectRolePermission;
import edu.ptit.ttcs.entity.ProjectRolePermission.ProjectRolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRolePermissionRepository extends JpaRepository<ProjectRolePermission, ProjectRolePermissionId> {
    
    @Query("SELECT prp FROM ProjectRolePermission prp WHERE prp.projectRole.id = :projectRoleId")
    List<ProjectRolePermission> findByProjectRoleId(@Param("projectRoleId") Long projectRoleId);
    
    @Query("SELECT prp FROM ProjectRolePermission prp WHERE prp.projectRole.id = :projectRoleId AND prp.isEnabled = true")
    List<ProjectRolePermission> findByProjectRoleIdAndIsEnabledTrue(@Param("projectRoleId") Long projectRoleId);
    
    @Query("SELECT prp FROM ProjectRolePermission prp WHERE prp.projectRole = :projectRole AND prp.permission = :permission")
    Optional<ProjectRolePermission> findByProjectRoleAndPermission(
        @Param("projectRole") ProjectRole projectRole, 
        @Param("permission") Permission permission);
    
    @Query("SELECT prp.permission FROM ProjectRolePermission prp WHERE prp.projectRole.id = :roleId AND prp.isEnabled = true")
    List<Permission> findEnabledPermissionsByRoleId(@Param("roleId") Long roleId);
    
    @Modifying
    @Query("DELETE FROM ProjectRolePermission prp WHERE prp.projectRole.id = :projectRoleId")
    void deleteByProjectRoleId(@Param("projectRoleId") Long projectRoleId);
} 