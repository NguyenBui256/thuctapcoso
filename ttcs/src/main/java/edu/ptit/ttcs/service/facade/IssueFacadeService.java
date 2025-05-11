package edu.ptit.ttcs.service.facade;

import edu.ptit.ttcs.dao.*;
import edu.ptit.ttcs.dto.request.AddIssueDTO;
import edu.ptit.ttcs.dto.request.CommentRequestDTO;
import edu.ptit.ttcs.entity.*;
import edu.ptit.ttcs.entity.dto.ActivityDTO;
import edu.ptit.ttcs.entity.dto.AttachmentDTO;
import edu.ptit.ttcs.entity.dto.request.FilterParams;
import edu.ptit.ttcs.entity.dto.response.*;
import edu.ptit.ttcs.entity.enums.StatusType;
import edu.ptit.ttcs.exception.RequestException;
import edu.ptit.ttcs.service.ActivityService;
import edu.ptit.ttcs.service.ProjectMemberServiceT;
import edu.ptit.ttcs.service.ProjectService;
import edu.ptit.ttcs.service.ProjectSettingServiceT;
import edu.ptit.ttcs.specs.IssueSpecs;
import edu.ptit.ttcs.util.ModelMapper;
import edu.ptit.ttcs.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class IssueFacadeService {

    private final IssueRepository issueRepository;
    private final CommentRepository commentRepository;
    private final ActivityService activityService;
    private final ProjectService projectService;
    private final ProjectMemberServiceT projectMemberService;
    private final ProjectRoleRepository projectRoleRepository;
    private final ProjectSettingServiceT projectSettingService;
    private final SecurityUtils securityUtils;
    private final SprintRepository sprintRepository;
    private final EpicRepository epicRepository;

    public List<IssueDTO> getList(long projectId,
            Long sprintId,
            boolean excludeSprint,
            String sortBy,
            String order,
            FilterParams filters) {
        Project project = projectService.findById(projectId);
        Specification<Issue> specs = Specification.where(
                IssueSpecs.belongToProject(projectId));
        User user = securityUtils.getCurrentUser();
        ProjectMember member = projectMemberService.getByProjectAndUser(project, user);
        if (member == null)
            throw new RequestException("Member not belong to project");
        if(excludeSprint){
            specs = specs.and(IssueSpecs.notBelongToSprint());
        }
        else{
            if (sprintId != null) {
                Sprint sprint = sprintRepository.findById(sprintId)
                        .orElseThrow(() -> new RequestException("Sprint not found"));
                if (!sprint.getProject().getId().equals(project.getId()))
                    throw new RequestException("Sprint not belong to project");
                specs = specs.and(IssueSpecs.belongToSprint(sprintId));
            }
        }
        if (filters.getKeyword() != null) {
            specs = specs.and(IssueSpecs.hasKeyword(filters.getKeyword()));
        }
        if (filters.getRoles() != null) {
            specs = specs.and(IssueSpecs.byMemberRoles(filters.getRoles(), false));
        }
        if (filters.getExcludeRoles() != null) {
            specs = specs.and(IssueSpecs.byMemberRoles(filters.getExcludeRoles(), true));
        }
        if (filters.getAssigns() != null) {
            specs = specs.and(IssueSpecs.byAssignees(filters.getAssigns(), false));
        }
        if (filters.getExcludeAssigns() != null) {
            specs = specs.and(IssueSpecs.byAssignees(filters.getExcludeAssigns(), true));
        }
        if (filters.getStatuses() != null) {
            specs = specs.and(IssueSpecs.byStatuses(filters.getStatuses(), false));
        }
        if (filters.getExcludeStatuses() != null) {
            specs = specs.and(IssueSpecs.byStatuses(filters.getExcludeStatuses(), true));
        }
        if (filters.getCreatedBy() != null) {
            specs = specs.and(IssueSpecs.byCreatedBy(filters.getCreatedBy(), false));
        }
        if (filters.getExcludeCreatedBy() != null) {
            specs = specs.and(IssueSpecs.byCreatedBy(filters.getExcludeCreatedBy(), true));
        }
        if (filters.getTags() != null) {
            specs = specs.and(IssueSpecs.byTags(filters.getTags(), false));
        }
        if (filters.getExcludeTags() != null) {
            specs = specs.and(IssueSpecs.byTags(filters.getExcludeTags(), true));
        }
        if (filters.getTypes() != null) {
            specs = specs.and(IssueSpecs.byTypes(filters.getTypes(), false));
        }
        if (filters.getExcludeTypes() != null) {
            specs = specs.and(IssueSpecs.byTypes(filters.getExcludeTypes(), true));
        }
        if (filters.getSeverities() != null) {
            specs = specs.and(IssueSpecs.bySeverities(filters.getSeverities(), false));
        }
        if (filters.getExcludeSeverities() != null) {
            specs = specs.and(IssueSpecs.bySeverities(filters.getExcludeSeverities(), true));
        }
        if (filters.getPriorities() != null) {
            specs = specs.and(IssueSpecs.byPriorities(filters.getPriorities(), false));
        }
        if (filters.getExcludePriorities() != null) {
            specs = specs.and(IssueSpecs.byPriorities(filters.getExcludePriorities(), true));
        }
        specs = switch (sortBy.toLowerCase()) {
            case "type" -> specs.and(IssueSpecs.orderByType(order));
            case "severity" -> specs.and(IssueSpecs.orderBySeverity(order));
            case "priority" -> specs.and(IssueSpecs.orderByPriority(order));
            case "status" -> specs.and(IssueSpecs.orderByStatus(order));
            case "position" -> specs.and(IssueSpecs.orderByPosition(order));
            case "updateddate" -> specs.and(IssueSpecs.orderByUpdatedAt(order));
            default -> specs;
        };
        List<Issue> issues = issueRepository.findAll(specs);
        return issues.stream().map(this::toDTO).toList();
    }

    public FilterData getFilters(long projectId,
            FilterParams filters) {
        Project project = projectService.findById(projectId);

        List<Long> assignFiltered = Stream.of(filters.getAssigns(), filters.getExcludeAssigns())
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();

        List<Long> statusFiltered = Stream.of(filters.getStatuses(), filters.getExcludeStatuses())
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();

        List<Long> createdByFiltered = Stream.of(filters.getCreatedBy(), filters.getExcludeCreatedBy())
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();

        List<Long> roleFiltered = Stream.of(filters.getRoles(), filters.getExcludeRoles())
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();

        List<Long> tagFiltered = Stream.of(filters.getTags(), filters.getExcludeTags())
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();

        List<Long> typeFiltered = Stream.of(filters.getTypes(), filters.getExcludeTypes())
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();

        List<Long> severityFiltered = Stream.of(filters.getSeverities(), filters.getExcludeSeverities())
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();

        List<Long> priorityFiltered = Stream.of(filters.getPriorities(), filters.getExcludePriorities())
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .toList();

        List<ProjectMember> members = projectMemberService.getAllByProject(project);
        List<PjMemberDTO> memberDTOS = members.stream()
                .map(member -> {
                    PjMemberDTO dto = new PjMemberDTO();
                    dto.setId(member.getId());
                    dto.setFullName(member.getUser().getFullName());
                    dto.setAvatar(member.getUser().getAvatar());
                    dto.setUserId(member.getUser().getId());
                    return dto;
                })
                .toList();
        List<PjStatusDTO> statuses = projectSettingService.getAllStatusByProject(project, StatusType.ISSUE).stream()
                .map(status -> ModelMapper.getInstance().map(status, PjStatusDTO.class))
                .filter(dto -> statusFiltered.stream().noneMatch(st -> st == dto.getId()))
                .toList();
        List<PjRoleDTO> roles = projectRoleRepository.findAllByProject(project).stream()
                .map(role -> ModelMapper.getInstance().map(role, PjRoleDTO.class))
                .filter(dto -> roleFiltered.stream().noneMatch(r -> r == dto.getId()))
                .toList();
        List<PjTagDTO> tags = projectSettingService.getAllTagByProject(project)
                .stream()
                .map(tag -> ModelMapper.getInstance().map(tag, PjTagDTO.class))
                .filter(dto -> tagFiltered.stream().noneMatch(r -> r == dto.getId()))
                .toList();
        List<PjTypeDTO> types = projectSettingService.getAllTypeByProject(project)
                .stream()
                .map(type -> ModelMapper.getInstance().map(type, PjTypeDTO.class))
                .filter(dto -> typeFiltered.stream().noneMatch(r -> r == dto.getId()))
                .toList();
        List<PjSeverityDTO> severities = projectSettingService.getAllSeverityByProject(project)
                .stream()
                .map(sev -> ModelMapper.getInstance().map(sev, PjSeverityDTO.class))
                .filter(dto -> severityFiltered.stream().noneMatch(r -> r == dto.getId()))
                .toList();
        List<PjPriorityDTO> priorities = projectSettingService.getAllPrioByProject(project)
                .stream()
                .map(prio -> ModelMapper.getInstance().map(prio, PjPriorityDTO.class))
                .filter(dto -> priorityFiltered.stream().noneMatch(r -> r == dto.getId()))
                .toList();
        return FilterData.builder()
                .assigns(memberDTOS.stream().filter(dto -> assignFiltered.stream().noneMatch(a -> a == dto.getId()))
                        .toList())
                .createdBy(memberDTOS.stream()
                        .filter(dto -> createdByFiltered.stream().noneMatch(a -> a == dto.getId())).toList())
                .statuses(statuses)
                .roles(roles)
                .tags(tags)
                .types(types)
                .priorities(priorities)
                .severities(severities)
                .build();
    }

    @Transactional
    public IssueDTO add(long projectId,
            Long sprintId,
            Long epicId,
            @Valid AddIssueDTO dto) {
        Project project = projectService.findById(projectId);
        User user = securityUtils.getCurrentUser();
        ProjectMember member = projectMemberService.getByProjectAndUser(project, user);
        if (member == null) {
            throw new RequestException("Member not found");
        }
        if (dto.getDueDate() != null && dto.getDueDate().isBefore(LocalDate.now()))
            throw new RequestException("Due date cannot be before current date");
        Issue issue = ModelMapper.getInstance().map(dto, Issue.class);
        issue.setProject(project);
        issue.setCreatedBy(member);
        issue.setCreatedDate(LocalDateTime.now());
        issue.setUpdatedBy(member);
        issue.setUpdatedDate(LocalDateTime.now());
        ProjectSettingType type = projectSettingService.getTypeById(dto.getType().getId());
        issue.setType(type);
        ProjectSettingStatus status = projectSettingService.getStatusById(dto.getStatus().getId());
        if (!status.getType().equals(StatusType.ISSUE))
            throw new RequestException("Status type not supported");
        issue.setStatus(status);
        ProjectSettingPriority priority = projectSettingService.getPrioById(dto.getPriority().getId());
        issue.setPriority(priority);
        ProjectSettingSeverity severity = projectSettingService.getSeverityById(dto.getSeverity().getId());
        issue.setSeverity(severity);
        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            List<ProjectSettingTag> allTags = projectSettingService.getAllTagByProject(project)
                    .stream()
                    .filter(tag -> dto.getTags().stream().anyMatch(t -> t.getId() == tag.getId()))
                    .toList();
            issue.setTags(allTags);
        }
        if (dto.getAssignee() != null) {
            ProjectMember assignee = projectMemberService.getById(dto.getAssignee().getId());
            if (!Objects.equals(assignee.getProject().getId(), project.getId()))
                throw new RequestException("Assignee is not in project");
            issue.setAssignee(assignee);
        }
        if (sprintId != null) {
            Sprint sprint = sprintRepository.findById(sprintId)
                    .orElseThrow(() -> new RequestException("Sprint not found"));
            issue.setSprint(sprint);
        }
        if (epicId != null) {
            Epic epic = epicRepository.findById(epicId)
                    .orElseThrow(() -> new RequestException("Epic not found"));
            issue.setEpic(epic);
        }
        Optional<Issue> lastIssue = issueRepository.findLastByProject(project.getId());
        if (lastIssue.isPresent()) {
            issue.setPosition(lastIssue.get().getPosition() + 1);
        } else
            issue.setPosition(1);
        issue = issueRepository.save(issue);

        // Log activity for issue creation
        activityService.recordActivity(
                project.getId(),
                issue.getId(),
                user.getId(),
                "issue_created",
                "Created issue: " + issue.getSubject());

        return toDTO(issue);
    }

    @Transactional
    public IssueDTO update(long issueId, AddIssueDTO dto) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RequestException("Issue not found"));
        User user = securityUtils.getCurrentUser();
        ProjectMember member = projectMemberService.getByProjectAndUser(issue.getProject(), user);
        if (member == null)
            throw new RequestException("Member is not in project");

        // Track changes for activity log
        StringBuilder changes = new StringBuilder();

        if (dto.getSubject() != null && !dto.getSubject().equals(issue.getSubject())) {
            changes.append("Subject changed from '").append(issue.getSubject()).append("' to '")
                    .append(dto.getSubject()).append("'. ");
            issue.setSubject(dto.getSubject());
        }

        if (dto.getDescription() != null && !dto.getDescription().equals(issue.getDescription())) {
            changes.append("Description updated. ");
            issue.setDescription(dto.getDescription());
        }

        if (dto.getPriority() != null) {
            ProjectSettingPriority priority = projectSettingService.getPrioById(dto.getPriority().getId());
            if (issue.getPriority() == null || issue.getPriority().getId() != priority.getId()) {
                changes.append("Priority changed to '").append(priority.getName()).append("'. ");
            }
            issue.setPriority(priority);
        }

        if (dto.getStatus() != null) {
            ProjectSettingStatus status = projectSettingService.getStatusById(dto.getStatus().getId());
            if (issue.getStatus() == null || issue.getStatus().getId() != status.getId()) {
                changes.append("Status changed to '").append(status.getName()).append("'. ");
            }
            issue.setStatus(status);
        }

        if (dto.getType() != null) {
            ProjectSettingType type = projectSettingService.getTypeById(dto.getType().getId());
            if (issue.getType() == null || issue.getType().getId() != type.getId()) {
                changes.append("Type changed to '").append(type.getName()).append("'. ");
            }
            issue.setType(type);
        }

        if (dto.getSeverity() != null) {
            ProjectSettingSeverity severity = projectSettingService.getSeverityById(dto.getSeverity().getId());
            if (issue.getSeverity() == null || issue.getSeverity().getId() != severity.getId()) {
                changes.append("Severity changed to '").append(severity.getName()).append("'. ");
            }
            issue.setSeverity(severity);
        }

        if (dto.getDueDate() != null) {
            if (dto.getDueDate().isBefore(LocalDate.now()))
                throw new RequestException("Due date cannot be before current date");
            if (!dto.getDueDate().equals(issue.getDueDate())) {
                changes.append("Due date set to ").append(dto.getDueDate()).append(". ");
            }
            issue.setDueDate(dto.getDueDate());
        }

        if (dto.getAssignee() != null) {
            ProjectMember assignee = null;
            try {
                assignee = projectMemberService.getById(dto.getAssignee().getId());
            } catch (Exception ignored) {
            }

            if (assignee != null && !Objects.equals(assignee.getProject().getId(), issue.getProject().getId()))
                throw new RequestException("Assignee is not in project");

            if ((issue.getAssignee() == null && assignee != null) ||
                    (issue.getAssignee() != null && assignee == null) ||
                    (issue.getAssignee() != null && assignee != null
                            && !issue.getAssignee().getId().equals(assignee.getId()))) {
                changes.append("Assignee changed to ")
                        .append(assignee != null ? assignee.getUser().getFullName() : "unassigned").append(". ");
            }

            issue.setAssignee(assignee);
        }

        if (dto.getTags() != null) {
            List<ProjectSettingTag> allTags = projectSettingService.getAllTagByProject(issue.getProject());
            List<ProjectSettingTag> selectTags = new ArrayList<>();
            for (ProjectSettingTag tag : allTags) {
                for (PjTagDTO td : dto.getTags()) {
                    if (td.getId() == tag.getId()) {
                        selectTags.add(tag);
                        break;
                    }
                }
            }

            // Check if tags have changed
            if (!selectTags.equals(issue.getTags())) {
                changes.append("Tags updated. ");
            }

            issue.setTags(selectTags);
        }

        issue.setUpdatedBy(member);
        issue.setUpdatedDate(LocalDateTime.now());
        issue = issueRepository.save(issue);

        // Log activity if changes were made
        if (changes.length() > 0) {
            activityService.recordActivity(
                    issue.getProject().getId(),
                    issue.getId(),
                    user.getId(),
                    "issue_updated",
                    changes.toString().trim());
        }

        return toDTO(issue);
    }

    public IssueDTO toDTO(Issue issue) {
        IssueDTO dto = ModelMapper.getInstance().map(issue, IssueDTO.class);
        dto.setType(projectSettingService.toDTO(issue.getType()));
        dto.setStatus(projectSettingService.toDTO(issue.getStatus()));
        dto.setPriority(projectSettingService.toDTO(issue.getPriority()));
        dto.setSeverity(projectSettingService.toDTO(issue.getSeverity()));
        dto.setTags(issue.getTags().stream().map(projectSettingService::toDTO).toList());
        dto.setAssignee(projectMemberService.toDTO(issue.getAssignee()));
        dto.setAttachments(issue.getAttachments().stream().map(AttachmentDTO::fromEntity).toList());
        return dto;
    }

    public IssueDTO get(long projectId, long issueId) {
        Project project = projectService.findById(projectId);
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RequestException("Issue not found"));
        if (!issue.getProject().getId().equals(project.getId()))
            throw new RequestException("Issue is not in project");
        return toDTO(issue);
    }

    public void delete(long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RequestException("Issue not found"));
        User user = securityUtils.getCurrentUser();
        projectMemberService.getByProjectAndUser(issue.getProject(), user);

        // Log activity before deletion
        activityService.recordActivity(
                issue.getProject().getId(),
                issue.getId(),
                user.getId(),
                "issue_deleted",
                "Deleted issue: " + issue.getSubject());

        issueRepository.delete(issue);
    }

    @Transactional
    public List<CommentResponseDTO> getComments(long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RequestException("Issue not found"));

        List<Comment> comments = commentRepository.findByIssueOrderByCreatedAtDesc(issue);
        return comments.stream()
                .map(this::toCommentDTO)
                .toList();
    }

    @Transactional
    public CommentResponseDTO addComment(long issueId, CommentRequestDTO commentDTO) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RequestException("Issue not found"));

        User user = securityUtils.getCurrentUser();
        ProjectMember member = projectMemberService.getByProjectAndUser(issue.getProject(), user);
        if (member == null)
            throw new RequestException("Member is not in project");

        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setIssue(issue);
        comment.setUser(user);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());

        comment = commentRepository.save(comment);

        // Log activity for comment
        activityService.recordActivity(
                issue.getProject().getId(),
                issue.getId(),
                user.getId(),
                "comment_added",
                "Added a comment: " + commentDTO.getContent());

        return toCommentDTO(comment);
    }

    public void deleteComment(long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RequestException("Comment not found"));

        User user = securityUtils.getCurrentUser();

        // Only comment creator or admin can delete
        if (!comment.getUser().getId().equals(user.getId())) {
            ProjectMember member = projectMemberService.getByProjectAndUser(comment.getIssue().getProject(), user);
            if (member == null || !member.getProjectRole().getRoleName().equalsIgnoreCase("admin"))
                throw new RequestException("Not authorized to delete this comment");
        }

        // Log activity before deletion
        activityService.recordActivity(
                comment.getIssue().getProject().getId(),
                comment.getIssue().getId(),
                user.getId(),
                "comment_deleted",
                "Deleted a comment");

        commentRepository.delete(comment);
    }

    public List<ActivityDTO> getActivities(long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RequestException("Issue not found"));

        User user = securityUtils.getCurrentUser();
        return activityService.getIssueActivities(issue.getId(), user.getId());
    }

    private CommentResponseDTO toCommentDTO(Comment comment) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setUserId(comment.getUser().getId());
        dto.setUserFullName(comment.getUser().getFullName());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }

    public void detach(long issueId, long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RequestException("Sprint not found"));
        User user = securityUtils.getCurrentUser();
        ProjectMember member = projectMemberService.getByProjectAndUser(sprint.getProject(), user);
        if (member == null)
            throw new RequestException("Member is not in project");
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RequestException("Issue not found"));
        issue.setSprint(null);
        issueRepository.save(issue);
    }

    public void attach(long issueId, long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RequestException("Sprint not found"));
        User user = securityUtils.getCurrentUser();
        ProjectMember member = projectMemberService.getByProjectAndUser(sprint.getProject(), user);
        if (member == null)
            throw new RequestException("Member is not in project");
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RequestException("Issue not found"));
        issue.setSprint(sprint);
        issueRepository.save(issue);
    }
}
