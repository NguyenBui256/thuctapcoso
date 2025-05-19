package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Watcher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatcherRepository extends JpaRepository<Watcher, Long> {

    /**
     * Find all watchers for a specific issue
     * 
     * @param issueId The ID of the issue
     * @return List of watchers
     */
    List<Watcher> findByIssueId(Long issueId);

    /**
     * Find a watcher by issue ID and user ID
     * 
     * @param issueId The ID of the issue
     * @param userId  The ID of the user
     * @return Optional containing the watcher if found
     */
    Optional<Watcher> findByIssueIdAndUserId(Long issueId, Long userId);

    List<Watcher> findByUserId(Long userId);
}