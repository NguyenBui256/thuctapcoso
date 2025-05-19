package edu.ptit.ttcs.entity.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class FilterData {

    private List<PjMemberDTO> assigns;

    private List<PjMemberDTO> createdBy;

    private List<PjStatusDTO> statuses;

    private List<PjTagDTO> tags;

    private List<PjRoleDTO> roles;

    private List<PjTypeDTO> types;

    private List<PjSeverityDTO> severities;

    private List<PjPriorityDTO> priorities;

}
