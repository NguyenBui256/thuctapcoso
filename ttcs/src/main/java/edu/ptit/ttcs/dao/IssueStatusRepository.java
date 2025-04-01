package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueStatusRepository extends JpaRepository<IssueStatus, Long> {
    List<IssueStatus> findByProjectId(Long projectId);
}