package edu.ptit.ttcs.specs;

import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.UserStory;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class UserStorySpecs {

    public static Specification<UserStory> hasKeyword(String keyword) {
        return (root, query, builder) ->
                builder.like(builder.lower(root.get("name")), "%" + keyword.toLowerCase() + "%");
    }

    public static Specification<UserStory> byMemberRoles(List<Long> roleIds, boolean exclude) {
        return (root, query, builder) -> {
            Join<UserStory, ProjectMember> assignedUserJoin = root.join("assignedUsers");
            return exclude ? builder.or(builder.isNull(assignedUserJoin),
                            builder.not(assignedUserJoin.get("projectRole").get("id").in(roleIds))) :
                    assignedUserJoin.get("projectRole").get("id").in(roleIds);
        };
    }

    public static Specification<UserStory> byAssignedMembers(List<Long> memberIds, boolean exclude) {
        return (root, query, builder) -> {
            Join<UserStory, ProjectMember> assignedUserJoin = root.join("assignedUsers");
            return exclude ? builder.or(builder.isNull(assignedUserJoin),
                            builder.not(assignedUserJoin.get("id").in(memberIds))) :
                    assignedUserJoin.get("id").in(memberIds);
        };
    }

    public static Specification<UserStory> byStatuses(List<Long> statusIds, boolean exclude) {
        return (root, query, builder) ->
                exclude ? builder.not(root.get("status").get("id").in(statusIds)):
                        root.get("status").get("id").in(statusIds);
    }

    public static Specification<UserStory> byCreatedMembers(List<Long> memberIds, boolean exclude) {
        return (root, query, builder) -> {
            Join<UserStory, ProjectMember> assignedUserJoin = root.join("createdBy");
            return exclude ? builder.not(assignedUserJoin.get("id").in(memberIds)) :
                    assignedUserJoin.get("id").in(memberIds);
        };
    }

    public static Specification<UserStory> belongToProject(long projectId) {
        return (root, query, builder) ->
            builder.equal(root.get("project").get("id"), projectId);
    }

    public static Specification<UserStory> belongToSprint(long sprintId) {
        return (root, query, builder) ->
                builder.equal(root.get("sprint").get("id"), sprintId);
    }

    public static Specification<UserStory> notBelongToSprint() {
        return (root, query, builder) ->
                builder.isNull(root.get("sprint"));
    }

}
