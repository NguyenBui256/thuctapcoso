package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByStartDateBeforeAndEndDateAfter(LocalDateTime now, LocalDateTime now2);

    List<Sprint> findByEndDateBefore(LocalDateTime now);

    List<Sprint> findByStartDateAfter(LocalDateTime now);

    List<Sprint> findAllByProject(Project project);
}