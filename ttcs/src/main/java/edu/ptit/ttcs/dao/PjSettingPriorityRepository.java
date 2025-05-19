package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectSettingPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PjSettingPriorityRepository extends JpaRepository<ProjectSettingPriority, Integer> {
    List<ProjectSettingPriority> findAllByProject(Project project);
}
