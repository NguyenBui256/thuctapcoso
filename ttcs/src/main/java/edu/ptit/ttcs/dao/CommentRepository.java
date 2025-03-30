package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Comment;
import edu.ptit.ttcs.entity.Issue;
import edu.ptit.ttcs.entity.Task;
import edu.ptit.ttcs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByUser(User user);
    List<Comment> findByTask(Task task);
    List<Comment> findByIssue(Issue issue);
    List<Comment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
} 