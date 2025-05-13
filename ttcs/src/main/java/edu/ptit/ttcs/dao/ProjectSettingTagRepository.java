package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectSettingTag;
import edu.ptit.ttcs.entity.dto.response.PjTagDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectSettingTagRepository extends JpaRepository<ProjectSettingTag, Long> {

    List<ProjectSettingTag> findAllByProject(Project project);

}