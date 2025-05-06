package edu.ptit.ttcs.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import edu.ptit.ttcs.dao.ProjectMemberRepository;
import edu.ptit.ttcs.dao.ProjectWikiPageRepository;
import edu.ptit.ttcs.entity.ProjectMember;
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
import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.Attachment;
import edu.ptit.ttcs.dao.AttachmentRepository;
import edu.ptit.ttcs.entity.dto.AttachmentDTO;

@Service
@RequiredArgsConstructor
public class ProjectWikiService {
        private final ProjectWikiPageRepository wikiPageRepository;
        private final ProjectRepository projectRepository;
        private final UserRepository userRepository;
        private final ProjectMemberRepository projectMemberRepository;
        private final AttachmentRepository attachmentRepository;

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

                // Find ProjectMember for this user and project
                ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                                project.getId(), user.getId());
                if (projectMember == null) {
                        throw new IllegalArgumentException("User is not a member of this project");
                }

                ProjectWikiPage wikiPage = new ProjectWikiPage();
                wikiPage.setProject(project);
                wikiPage.setTitle(request.getTitle());
                wikiPage.setContent(request.getContent());
                wikiPage.setCreatedBy(projectMember);
                wikiPage.setUpdatedBy(projectMember);
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

                // Find ProjectMember for this user and project
                ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                                projectId, user.getId());
                if (projectMember == null) {
                        throw new IllegalArgumentException("User is not a member of this project");
                }

                wikiPage.setTitle(request.getTitle());
                wikiPage.setContent(request.getContent());
                wikiPage.setUpdatedBy(projectMember);
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

        @Transactional
        public ProjectWikiPageDTO addAttachmentToWikiPage(
                        Long projectId, Long wikiPageId, Long userId, AttachmentDTO attachmentDTO) {

                validateUserAccess(projectId, userId);

                // Find the wiki page
                ProjectWikiPage wikiPage = wikiPageRepository
                                .findByIdAndProjectIdAndIsDeleteFalse(wikiPageId, projectId)
                                .orElseThrow(() -> new IllegalArgumentException("Wiki page not found"));

                // Find the user
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                // Create a new attachment
                Attachment attachment = new Attachment();
                attachment.setFilename(attachmentDTO.getFilename());
                attachment.setContentType(attachmentDTO.getContentType());
                attachment.setFileSize(attachmentDTO.getFileSize());
                attachment.setUrl(attachmentDTO.getUrl());
                attachment.setIsDelete(false);
                attachment.setCreatedAt(LocalDateTime.now());
                attachment.setCreatedBy(user);

                // Save the attachment to get an ID
                Attachment savedAttachment = attachmentRepository.save(attachment);

                // Add the attachment to the wiki page
                wikiPage.getAttachments().add(savedAttachment);
                wikiPage.setUpdatedAt(LocalDateTime.now());

                // Find ProjectMember for this user and project
                ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserIdAndIsDeleteFalse(
                                projectId, userId);
                if (projectMember != null) {
                        wikiPage.setUpdatedBy(projectMember);
                }

                // Save the updated wiki page
                ProjectWikiPage savedWikiPage = wikiPageRepository.save(wikiPage);

                return ProjectWikiPageDTO.fromEntity(savedWikiPage);
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

        /**
         * Get project ID associated with a wiki page
         *
         * @param wikiPageId The ID of the wiki page
         * @return The project ID or null if not found
         */
        public Long getProjectIdFromWikiPage(Long wikiPageId) {
                try {
                        ProjectWikiPage wikiPage = wikiPageRepository
                                        .findById(wikiPageId)
                                        .orElse(null);

                        if (wikiPage != null && wikiPage.getProject() != null) {
                                return wikiPage.getProject().getId();
                        }
                        return null;
                } catch (Exception e) {
                        return null;
                }
        }
}