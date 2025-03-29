package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Permissions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionsRepository extends JpaRepository<Permissions, Long> {
    List<Permissions> findByModule(String module);
    List<Permissions> findByMethod(String method);
    Optional<Permissions> findByApiPathAndMethod(String apiPath, String method);
    List<Permissions> findByName(String name);
} 