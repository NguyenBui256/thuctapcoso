package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.ProjectModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectModuleRepository extends JpaRepository<ProjectModule, Long> {
    List<ProjectModule> findByProjectId(Long projectId);

    void deleteByProjectId(Long projectId);
}