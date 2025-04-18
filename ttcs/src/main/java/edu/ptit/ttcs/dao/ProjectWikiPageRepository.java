package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectWikiPage;
import edu.ptit.ttcs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectWikiPageRepository extends JpaRepository<ProjectWikiPage, Integer> {
    Optional<ProjectWikiPage> findByIdAndProjectIdAndIsDeleteFalse(Long id, Long projectId);

    List<ProjectWikiPage> findByProject(Project project);

    List<ProjectWikiPage> findByCreatedBy(User user);

    List<ProjectWikiPage> findByUpdatedBy(User user);

}