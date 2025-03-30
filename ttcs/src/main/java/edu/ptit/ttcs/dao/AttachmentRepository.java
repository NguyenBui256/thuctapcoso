package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Attachment;
import edu.ptit.ttcs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Integer> {
    List<Attachment> findByType(String type);
    List<Attachment> findByCreatedBy(User createdBy);
    List<Attachment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Attachment> findByIsDelete(Boolean isDelete);
} 