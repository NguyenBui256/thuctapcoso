package edu.ptit.ttcs.entity.dto.response;

import edu.ptit.ttcs.entity.ProjectMember;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class FilterData {

    private List<PjMemberDTO> assignedTo;

    private List<PjMemberDTO> createdBy;

    private List<PjStatusDTO> statuses;

    private List<PjTagDTO> tags;

    private List<PjRoleDTO> roles;

}
