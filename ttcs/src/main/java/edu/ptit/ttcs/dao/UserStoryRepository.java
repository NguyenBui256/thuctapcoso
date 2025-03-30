package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.UserStory;
import edu.ptit.ttcs.entity.Sprint;
import edu.ptit.ttcs.entity.PjsettingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UserStoryRepository extends JpaRepository<UserStory, Integer> {
    List<UserStory> findBySprint(Sprint sprint);
    List<UserStory> findByStatus(PjsettingStatus status);
    List<UserStory> findByIsBlock(Boolean isBlock);
    List<UserStory> findByDueDate(LocalDate dueDate);
} 