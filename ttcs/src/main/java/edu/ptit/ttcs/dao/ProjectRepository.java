package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedBy(User owner);

    Page<Project> findByIsDeletedFalse(Pageable pageable);

    Page<Project> findByIsPublicTrueAndIsDeletedFalse(Pageable pageable);

    List<Project> findByIsDeletedFalse();
}