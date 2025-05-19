package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.ProjectRolePermissionRepository;
import edu.ptit.ttcs.entity.Permission;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.ProjectRolePermission;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectRolePermissionService {

    private final ProjectRolePermissionRepository projectRolePermissionRepository;

    public List<ProjectRolePermission> findByProjectRoleId(Long projectRoleId) {
        List<ProjectRolePermission> result = projectRolePermissionRepository.findByProjectRoleId(projectRoleId);
        
        // Debug log
        log.info("Retrieved {} permissions for role {}", result.size(), projectRoleId);
        for (ProjectRolePermission prp : result) {
            log.info("Role {} - Permission {} - isEnabled: {} - Raw value type: {}",
                    projectRoleId,
                    prp.getPermission().getId(),
                    prp.getIsEnabled(),
                    prp.getIsEnabled() != null ? prp.getIsEnabled().getClass().getName() : "null");
        }
        
        return result;
    }

    public List<ProjectRolePermission> findEnabledByProjectRoleId(Long projectRoleId) {
        return projectRolePermissionRepository.findByProjectRoleIdAndIsEnabledTrue(projectRoleId);
    }

    public Optional<ProjectRolePermission> findByProjectRoleAndPermission(ProjectRole projectRole, Permission permission) {
        return projectRolePermissionRepository.findByProjectRoleAndPermission(projectRole, permission);
    }

    public List<Permission> findEnabledPermissionsByRoleId(Long roleId) {
        return projectRolePermissionRepository.findEnabledPermissionsByRoleId(roleId);
    }

    @Transactional
    public ProjectRolePermission save(ProjectRolePermission projectRolePermission) {
        return projectRolePermissionRepository.save(projectRolePermission);
    }

    @Transactional
    public void deleteByProjectRoleId(Long projectRoleId) {
        projectRolePermissionRepository.deleteByProjectRoleId(projectRoleId);
    }
    
    /**
     * Get raw data from database for debugging
     * @param roleId role ID
     */
    public void debugRawData(Long roleId) {
        List<Object[]> rawData = projectRolePermissionRepository.findRawDataByRoleId(roleId);
        log.info("Raw data from database for role {}: {} rows", roleId, rawData.size());
        
        for (Object[] row : rawData) {
            log.info("Raw row data: ID={}, RoleID={}, PermissionID={}, isEnabled={} ({})",
                    row[0],
                    row[1],
                    row[2],
                    row[3],
                    row[3] != null ? row[3].getClass().getName() : "null");
        }
    }
} 