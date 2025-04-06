package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Epic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpicRepository extends JpaRepository<Epic, Long> {
    List<Epic> findByProjectId(Long projectId);
}