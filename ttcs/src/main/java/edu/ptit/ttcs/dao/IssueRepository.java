package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Issue;
import edu.ptit.ttcs.entity.PjsettingStatus;
import edu.ptit.ttcs.entity.PjsettingType;
import edu.ptit.ttcs.entity.PjsettingPriority;
import edu.ptit.ttcs.entity.PjsettingSeverity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Integer> {
    List<Issue> findByStatus(PjsettingStatus status);
    List<Issue> findByType(PjsettingType type);
    List<Issue> findByPriority(PjsettingPriority priority);
    List<Issue> findBySeverity(PjsettingSeverity severity);
    List<Issue> findByDueDate(LocalDate dueDate);
} 