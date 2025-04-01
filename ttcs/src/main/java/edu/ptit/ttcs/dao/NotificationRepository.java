package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Notification;
import edu.ptit.ttcs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByReceiver(User receiver);

    List<Notification> findByReceiverAndType(User receiver, String type);
}