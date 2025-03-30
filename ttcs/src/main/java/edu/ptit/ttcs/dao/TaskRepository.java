package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Task;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.UserStory;
import edu.ptit.ttcs.entity.PjsettingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByUser(User user);
    List<Task> findByUserStory(UserStory userStory);
    List<Task> findByStatus(PjsettingStatus status);
    List<Task> findByDueDate(LocalDate dueDate);
} 