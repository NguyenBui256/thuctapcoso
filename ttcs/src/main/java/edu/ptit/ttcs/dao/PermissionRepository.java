package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    List<Permission> findByModule(String module);
    List<Permission> findByMethodAndModule(String method, String module);
} 