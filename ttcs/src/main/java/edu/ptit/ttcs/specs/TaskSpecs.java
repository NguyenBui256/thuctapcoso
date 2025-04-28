package edu.ptit.ttcs.specs;

import edu.ptit.ttcs.entity.ProjectMember;
import edu.ptit.ttcs.entity.Task;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class TaskSpecs {

    public static Specification<Task> belongToSprint(long sprintId){
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("sprint").get("id"), sprintId);
    }

    public static Specification<Task> hasKeyword(String keyword) {
        return (root, query, builder) ->
                builder.like(builder.lower(root.get("name")), "%" + keyword.toLowerCase() + "%");
    }

    public static Specification<Task> byMemberRoles(List<Long> roleIds, boolean exclude) {
        return (root, query, builder) -> {
            Join<Task, ProjectMember> assignedUserJoin = root.join("assigned");
            return exclude ? builder.or(builder.isNull(assignedUserJoin),
                            builder.not(assignedUserJoin.get("projectRole").get("id").in(roleIds))) :
                    assignedUserJoin.get("projectRole").get("id").in(roleIds);
        };
    }

    public static Specification<Task> byAssignedMembers(List<Long> memberIds, boolean exclude) {
        return (root, query, builder) -> {
            Join<Task, ProjectMember> assignedUserJoin = root.join("assigned");
            return exclude ? builder.or(builder.isNull(assignedUserJoin),
                                    builder.not(assignedUserJoin.get("id").in(memberIds))) :
                    assignedUserJoin.get("id").in(memberIds);
        };
    }

    public static Specification<Task> byStatuses(List<Long> statusIds, boolean exclude) {
        return (root, query, builder) ->
                exclude ? builder.not(root.get("status").get("id").in(statusIds)):
                        root.get("status").get("id").in(statusIds);
    }

    public static Specification<Task> byCreatedMembers(List<Long> memberIds, boolean exclude) {
        return (root, query, builder) -> {
            Join<Task, ProjectMember> assignedUserJoin = root.join("createdBy");
            return exclude ? builder.not(assignedUserJoin.get("id").in(memberIds)) :
                    assignedUserJoin.get("id").in(memberIds);
        };
    }

}
