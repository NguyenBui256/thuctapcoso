package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectSettingSeverity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface PjSettingSeverityRepository extends JpaRepository<ProjectSettingSeverity, Integer> {
    List<ProjectSettingSeverity> findAllByProject(Project project);
}
