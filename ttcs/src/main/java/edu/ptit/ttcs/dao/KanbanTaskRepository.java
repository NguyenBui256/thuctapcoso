package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.KanbanTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KanbanTaskRepository extends JpaRepository<KanbanTask, Integer> {

    List<KanbanTask> findBySwimlandId(Integer swimlandId);

    List<KanbanTask> findByProjectId(Integer projectId);

    @Query("SELECT t FROM KanbanTask t WHERE t.swimland.id = :swimlandId ORDER BY t.order ASC")
    List<KanbanTask> findBySwimlandIdOrderByOrder(Integer swimlandId);

    @Query("SELECT t FROM KanbanTask t WHERE t.project.id = :projectId AND t.status = :status ORDER BY t.order ASC")
    List<KanbanTask> findByProjectIdAndStatusOrderByOrder(Integer projectId, String status);

    @Query("SELECT MAX(t.taskNumber) FROM KanbanTask t WHERE t.project.id = :projectId")
    Integer findMaxTaskNumberByProjectId(Integer projectId);
}