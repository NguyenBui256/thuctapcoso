package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Comment;
import edu.ptit.ttcs.entity.Issue;
import edu.ptit.ttcs.entity.Task;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByUser(User user);

    List<Comment> findByTask(Task task);

    List<Comment> findByIssue(Issue issue);

    List<Comment> findByIssueOrderByCreatedAtDesc(Issue issue);

    List<Comment> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    List<Comment> findByTaskOrderByCreatedAtDesc(Task task);

    List<Comment> findByUserStoryOrderByCreatedAtDesc(UserStory userStory);
}