package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Watcher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WatcherRepository extends JpaRepository<Watcher, Long> {
}