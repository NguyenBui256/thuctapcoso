package edu.ptit.ttcs.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import edu.ptit.ttcs.dao.ProjectMemberRepository;
import edu.ptit.ttcs.dao.ProjectWikiPageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.ptit.ttcs.entity.Project;
import edu.ptit.ttcs.entity.ProjectWikiPage;
import edu.ptit.ttcs.entity.User;
import edu.ptit.ttcs.entity.dto.ProjectWikiPageDTO;
import edu.ptit.ttcs.entity.dto.ProjectWikiPageRequestDTO;
import edu.ptit.ttcs.dao.ProjectRepository;
import edu.ptit.ttcs.dao.UserRepository;

@Service
@RequiredArgsConstructor
public class ProjectWikiService {
        private final ProjectWikiPageRepository wikiPageRepository;
        private final ProjectRepository projectRepository;
        private final UserRepository userRepository;
        private final ProjectMemberRepository projectMemberRepository;

        public List<ProjectWikiPageDTO> getWikiPages(Long projectId, Long userId) {
                validateUserAccess(projectId, userId);

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new RuntimeException("Project not found"));

                List<ProjectWikiPage> wikiPages = wikiPageRepository.findByProjectAndIsDeleteFalse(project);
                return wikiPages.stream()
                                .map(ProjectWikiPageDTO::fromEntity)
                                .collect(Collectors.toList());
        }

        public ProjectWikiPageDTO getWikiPageById(Long projectId, Long wikiPageId, Long userId) {
                validateUserAccess(projectId, userId);

                ProjectWikiPage wikiPage = wikiPageRepository
                                .findByIdAndProjectIdAndIsDeleteFalse(wikiPageId, projectId)
                                .orElseThrow(() -> new IllegalArgumentException("Wiki page not found"));

                return ProjectWikiPageDTO.fromEntity(wikiPage);
        }

        @Transactional
        public ProjectWikiPageDTO createWikiPage(Long projectId, ProjectWikiPageRequestDTO request, Long userId) {
                validateUserAccess(projectId, userId);
                request.validate();

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                ProjectWikiPage wikiPage = new ProjectWikiPage();
                wikiPage.setProject(project);
                wikiPage.setTitle(request.getTitle());
                wikiPage.setContent(request.getContent());
                wikiPage.setCreatedBy(user);
                wikiPage.setUpdatedBy(user);
                wikiPage.setCreatedAt(LocalDateTime.now());
                wikiPage.setUpdatedAt(LocalDateTime.now());
                wikiPage.setIsDelete(false);
                wikiPage.setEditCount(0);

                ProjectWikiPage savedWikiPage = wikiPageRepository.save(wikiPage);
                return ProjectWikiPageDTO.fromEntity(savedWikiPage);
        }

        @Transactional
        public ProjectWikiPageDTO updateWikiPage(Long projectId, Long wikiPageId, ProjectWikiPageRequestDTO request,
                        Long userId) {
                validateUserAccess(projectId, userId);
                request.validate();

                ProjectWikiPage wikiPage = wikiPageRepository
                                .findByIdAndProjectIdAndIsDeleteFalse(wikiPageId, projectId)
                                .orElseThrow(() -> new IllegalArgumentException("Wiki page not found"));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                wikiPage.setTitle(request.getTitle());
                wikiPage.setContent(request.getContent());
                wikiPage.setUpdatedBy(user);
                wikiPage.setUpdatedAt(LocalDateTime.now());
                wikiPage.setEditCount(wikiPage.getEditCount() + 1);

                ProjectWikiPage updatedWikiPage = wikiPageRepository.save(wikiPage);
                return ProjectWikiPageDTO.fromEntity(updatedWikiPage);
        }

        @Transactional
        public void deleteWikiPage(Long projectId, Long wikiPageId, Long userId) {
                validateUserAccess(projectId, userId);

                ProjectWikiPage wikiPage = wikiPageRepository
                                .findByIdAndProjectIdAndIsDeleteFalse(wikiPageId, projectId)
                                .orElseThrow(() -> new IllegalArgumentException("Wiki page not found"));

                wikiPage.setIsDelete(true);
                wikiPageRepository.save(wikiPage);
        }

        private void validateUserAccess(Long projectId, Long userId) {
                // Check if the user has access to the project
                boolean hasAccess = isUserProjectMember(projectId, userId);
                if (!hasAccess) {
                        throw new IllegalArgumentException("User does not have access to the project");
                }
        }

        public boolean isUserProjectMember(Long projectId, Long userId) {
                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new RuntimeException("Project not found"));
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return projectMemberRepository.existsByProjectIdAndUserIdAndIsDeleteFalse(project.getId(),
                                user.getId());
        }
}