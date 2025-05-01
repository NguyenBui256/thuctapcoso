package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectDAO extends JpaRepository<Project, Integer> {
}