package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Integer> {
    List<Sprint> findByStartDateBefore(LocalDateTime date);
    List<Sprint> findByEndDateAfter(LocalDateTime date);
    List<Sprint> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDateTime date, LocalDateTime sameDate);
} 