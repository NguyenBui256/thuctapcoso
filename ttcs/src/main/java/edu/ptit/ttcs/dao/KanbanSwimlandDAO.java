package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.KanbanSwimland;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KanbanSwimlandDAO extends JpaRepository<KanbanSwimland, Integer> {

    List<KanbanSwimland> findByProjectId(Integer projectId);

    @Query("SELECT s FROM KanbanSwimland s WHERE s.project.id = :projectId ORDER BY s.order ASC")
    List<KanbanSwimland> findByProjectIdOrderByOrder(Integer projectId);

    @Query("SELECT s FROM KanbanSwimland s WHERE s.status = :status ORDER BY s.order ASC")
    List<KanbanSwimland> findByStatusOrderByOrder(String status);
}