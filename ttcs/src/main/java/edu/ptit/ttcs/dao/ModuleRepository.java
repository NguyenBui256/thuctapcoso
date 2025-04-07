package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByProjectsId(Long projectId);

    Optional<Module> findById(Long id);
}
