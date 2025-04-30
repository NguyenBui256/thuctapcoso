package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.ProjectSettingTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectSettingTagRepository extends JpaRepository<ProjectSettingTag, Integer> {
    // Basic CRUD methods are provided by JpaRepository
}