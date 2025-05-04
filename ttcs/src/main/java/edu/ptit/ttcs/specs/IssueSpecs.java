package edu.ptit.ttcs.specs;

import edu.ptit.ttcs.entity.Issue;
import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.ProjectSettingTag;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class IssueSpecs {

    public static Specification<Issue> belongToProject(long projectId){
        return (root, query, cb)->
                cb.equal(root.get("project").get("id"), projectId);
    }

    public static Specification<Issue> belongToSprint(long sprintId){
        return (root, query, cb)->
                cb.equal(root.get("sprint").get("id"), sprintId);
    }

    public static Specification<Issue> belongToEpic(long epicId){
        return (root, query, cb)->
                cb.equal(root.get("epic").get("id"), epicId);
    }

    public static Specification<Issue> hasKeyword(String keyword){
        return (root, query, cb)->
                cb.like(cb.lower(root.get("subject")), "%" +  keyword.toLowerCase() + "%");
    }

    public static Specification<Issue> byMemberRoles(List<Long> roleIds, boolean exclude) {
        return (root, query, builder) -> exclude ?
                builder.or(builder.isNull(root.get("assignee")),
                    builder.not(root.get("assignee").get("projectRole").get("id").in(roleIds))) :
                root.get("assignee").get("projectRole").get("id").in(roleIds);
    }

    public static Specification<Issue> byAssignees(List<Long> memberIds, boolean exclude) {
        return (root, query, builder) -> exclude ?
                builder.or(builder.isNull(root.get("assignee")),
                        builder.not(root.get("assignee").get("id").in(memberIds))) :
                root.get("assignee").get("id").in(memberIds);
    }

    public static Specification<Issue> byStatuses(List<Long> statusIds, boolean exclude) {
        return (root, query, builder) ->
                exclude ? builder.not(root.get("status").get("id").in(statusIds)):
                        root.get("status").get("id").in(statusIds);
    }

    public static Specification<Issue> byCreatedBy(List<Long> memberIds, boolean exclude) {
        return (root, query, builder) -> {
            Join<Issue, ProjectMember> createdByJoin = root.join("createdBy");
            return exclude ? builder.not(createdByJoin.get("id").in(memberIds)) :
                    createdByJoin.get("id").in(memberIds);
        };
    }

    public static Specification<Issue> byTags(List<Long> tagIds, boolean exclude) {
        return (r, q, b) -> {
            Join<Issue, ProjectSettingTag> tagJoin = r.join("tags");
            return exclude ? b.not(tagJoin.get("id").in(tagIds)) :
                    tagJoin.get("id").in(tagIds);
        };
    }

    public static Specification<Issue> byTypes(List<Long> typeIds, boolean exclude) {
        return (r, q, b) ->
                exclude ? b.not(r.get("type").get("id").in(typeIds))
                        : r.get("type").get("id").in(typeIds);
    }

    public static Specification<Issue> bySeverities(List<Long> severityIds, boolean exclude) {
        return (r, q, b) ->
                exclude ? b.not(r.get("severity").get("id").in(severityIds))
                        : r.get("severity").get("id").in(severityIds);
    }

    public static Specification<Issue> byPriorities(List<Long> priorityIds, boolean exclude) {
        return (r, q, b) ->
                exclude ? b.not(r.get("priority").get("id").in(priorityIds))
                        : r.get("priority").get("id").in(priorityIds);
    }

    public static Specification<Issue> orderByType(String order) {
        return (r, q, b) -> {
            q.orderBy(order.equalsIgnoreCase("asc") ? 
                b.asc(r.get("type").get("order")) : 
                b.desc(r.get("type").get("order")));
            return null;
        };
    }

    public static Specification<Issue> orderBySeverity(String order) {
        return (r, q, b) -> {
            q.orderBy(order.equalsIgnoreCase("asc") ? 
                b.asc(r.get("severity").get("order")) : 
                b.desc(r.get("severity").get("order")));
            return null;
        };
    }

    public static Specification<Issue> orderByPriority(String order) {
        return (r, q, b) -> {
            q.orderBy(order.equalsIgnoreCase("asc") ? 
                b.asc(r.get("priority").get("order")) : 
                b.desc(r.get("priority").get("order")));
            return null;
        };
    }

    public static Specification<Issue> orderByStatus(String order) {
        return (r, q, b) -> {
            q.orderBy(order.equalsIgnoreCase("asc") ? 
                b.asc(r.get("status").get("order")) : 
                b.desc(r.get("status").get("order")));
            return null;
        };
    }

    public static Specification<Issue> orderByPosition(String order) {
        return (r, q, b) -> {
            q.orderBy(order.equalsIgnoreCase("asc") ? 
                b.asc(r.get("position")) :
                b.desc(r.get("position")));
            return null;
        };
    }

    public static Specification<Issue> orderByUpdatedAt(String order) {
        return (r, q, b) -> {
            q.orderBy(order.equalsIgnoreCase("asc") ? 
                b.asc(r.get("updatedDate")) : 
                b.desc(r.get("updatedDate")));
            return null;
        };
    }

}
