package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.ProjectRolePermissionRepository;
import edu.ptit.ttcs.entity.Permission;
import edu.ptit.ttcs.entity.ProjectRole;
import edu.ptit.ttcs.entity.ProjectRolePermission;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectRolePermissionService {

    private final ProjectRolePermissionRepository projectRolePermissionRepository;

    public List<ProjectRolePermission> findByProjectRoleId(Long projectRoleId) {
        return projectRolePermissionRepository.findByProjectRoleId(projectRoleId);
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
} 