package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectSettingType;
import edu.ptit.ttcs.entity.dto.response.PjTypeDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PjSettingTypeRepository extends JpaRepository<ProjectSettingType, Integer> {
    List<ProjectSettingType> findAllByProject(Project project);
}
