package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectSettingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PjSettingStatusRepository extends JpaRepository<ProjectSettingStatus, Integer> {
    List<ProjectSettingStatus> findAllByProjectAndType(Project project, String type);
}
