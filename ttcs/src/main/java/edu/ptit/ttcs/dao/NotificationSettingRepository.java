package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.NotificationSetting;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {
    Optional<NotificationSetting> findByUserAndProject(User user, Project project);

    List<NotificationSetting> findByUser(User user);
}