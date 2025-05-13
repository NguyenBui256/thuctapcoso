package edu.ptit.ttcs.service;

import edu.ptit.ttcs.dao.PermissionRepository;
import edu.ptit.ttcs.entity.Permission;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PermissionService {
    private final PermissionRepository permissionRepository;

    public List<Permission> findAll() {
        return permissionRepository.findAll();
    }
    
    public Optional<Permission> findById(Long id) {
        return permissionRepository.findById(id);
    }
    
    public List<Permission> findByModule(String module) {
        return permissionRepository.findByModule(module);
    }
    
    public Permission save(Permission permission) {
        return permissionRepository.save(permission);
    }
} 