package edu.ptit.ttcs.service.impl;

import edu.ptit.ttcs.dao.IssueRepository;
import edu.ptit.ttcs.dao.ProjectWikiPageRepository;
import edu.ptit.ttcs.dao.TaskRepository;
import edu.ptit.ttcs.dao.UserStoryRepository;
import edu.ptit.ttcs.entity.Issue;
import edu.ptit.ttcs.entity.ProjectWikiPage;
import edu.ptit.ttcs.entity.Task;
import edu.ptit.ttcs.entity.UserStory;
import edu.ptit.ttcs.entity.dto.response.IssueDTO;
import edu.ptit.ttcs.entity.dto.response.SearchResponseDTO;
import edu.ptit.ttcs.entity.dto.response.TaskDTO;
import edu.ptit.ttcs.entity.dto.response.UserStoryDTO;
import edu.ptit.ttcs.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchServiceImpl implements SearchService {

    private final UserStoryRepository userStoryRepository;
    private final TaskRepository taskRepository;
    private final IssueRepository issueRepository;
    private final ProjectWikiPageRepository wikiPageRepository;

    @Autowired
    public SearchServiceImpl(
            UserStoryRepository userStoryRepository,
            TaskRepository taskRepository,
            IssueRepository issueRepository,
            ProjectWikiPageRepository wikiPageRepository) {
        this.userStoryRepository = userStoryRepository;
        this.taskRepository = taskRepository;
        this.issueRepository = issueRepository;
        this.wikiPageRepository = wikiPageRepository;
    }

    @Override
    public SearchResponseDTO search(Long projectId, String query) {
        // Create empty lists for results
        List<UserStory> userStories = new ArrayList<>();
        List<Task> tasks = new ArrayList<>();
        List<Issue> issues = new ArrayList<>();
        List<ProjectWikiPage> wikiPages = new ArrayList<>();

        String lowerCaseQuery = query.toLowerCase();

        try {
            // For User Stories
            try {
                userStories = userStoryRepository.findByProjectId(projectId).stream()
                        .filter(us -> us.getName() != null && us.getName().toLowerCase().contains(lowerCaseQuery))
                        .collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error searching user stories: " + e.getMessage());
            }

            // For Tasks
            try {
                // Fallback to finding all tasks and filtering manually
                tasks = taskRepository.findAll().stream()
                        .filter(task -> task.getProject() != null
                                && task.getProject().getId().equals(projectId)
                                && task.getName() != null
                                && task.getName().toLowerCase().contains(lowerCaseQuery))
                        .collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error searching tasks: " + e.getMessage());
            }

            // For Issues
            try {
                issues = issueRepository.findByProjectId(projectId).stream()
                        .filter(issue -> issue.getSubject() != null
                                && issue.getSubject().toLowerCase().contains(lowerCaseQuery))
                        .collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error searching issues: " + e.getMessage());
            }

            // For Wiki Pages
            try {
                // Fallback to finding all wiki pages and filtering manually
                wikiPages = wikiPageRepository.findAll().stream()
                        .filter(page -> page.getProject() != null
                                && page.getProject().getId().equals(projectId)
                                && ((page.getTitle() != null && page.getTitle().toLowerCase().contains(lowerCaseQuery))
                                        || (page.getContent() != null
                                                && page.getContent().toLowerCase().contains(lowerCaseQuery))))
                        .collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error searching wiki pages: " + e.getMessage());
            }
        } catch (Exception e) {
            System.err.println("Error during search: " + e.getMessage());
        }

        // Convert to DTOs
        List<UserStoryDTO> userStoryDTOs = userStories.stream()
                .map(this::convertToUserStoryDTO)
                .collect(Collectors.toList());

        List<TaskDTO> taskDTOs = tasks.stream()
                .map(this::convertToTaskDTO)
                .collect(Collectors.toList());

        List<IssueDTO> issueDTOs = issues.stream()
                .map(this::convertToIssueDTO)
                .collect(Collectors.toList());

        List<SearchResponseDTO.WikiPageDTO> wikiPageDTOs = wikiPages.stream()
                .map(this::convertToWikiPageDTO)
                .collect(Collectors.toList());

        // Create response with direct instantiation
        SearchResponseDTO result = new SearchResponseDTO();
        result.setUserStories(userStoryDTOs);
        result.setTasks(taskDTOs);
        result.setIssues(issueDTOs);
        result.setWikiPages(wikiPageDTOs);
        return result;
    }

    private UserStoryDTO convertToUserStoryDTO(UserStory userStory) {
        UserStoryDTO dto = new UserStoryDTO();
        dto.setId(userStory.getId());
        dto.setName(userStory.getName());
        return dto;
    }

    private TaskDTO convertToTaskDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setName(task.getName());
        return dto;
    }

    private IssueDTO convertToIssueDTO(Issue issue) {
        IssueDTO dto = new IssueDTO();
        dto.setId(issue.getId());

        // Set subject if method exists
        try {
            // Try to get the setSubject method via reflection
            java.lang.reflect.Method setSubjectMethod = IssueDTO.class.getMethod("setSubject", String.class);
            if (setSubjectMethod != null && issue.getSubject() != null) {
                setSubjectMethod.invoke(dto, issue.getSubject());
            }
        } catch (Exception e) {
            // Silently ignore if method doesn't exist
        }
        return dto;
    }

    private SearchResponseDTO.WikiPageDTO convertToWikiPageDTO(ProjectWikiPage wikiPage) {
        SearchResponseDTO.WikiPageDTO dto = new SearchResponseDTO.WikiPageDTO();
        dto.setId(wikiPage.getId());
        dto.setTitle(wikiPage.getTitle());
        dto.setContent(wikiPage.getContent());

        if (wikiPage.getCreatedAt() != null) {
            dto.setCreatedAt(wikiPage.getCreatedAt().toString());
        }

        if (wikiPage.getUpdatedAt() != null) {
            dto.setUpdatedAt(wikiPage.getUpdatedAt().toString());
        }

        return dto;
    }
}