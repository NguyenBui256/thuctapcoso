package edu.ptit.ttcs.entity.dto.response;

import edu.ptit.ttcs.entity.dto.ProjectMemberDTO;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class IssueDTO {

    private long id;

    private String name;

    private String description;

    private PjStatusDTO status;

    private PjTypeDTO type;

    private PjSeverityDTO severity;

    private PjPriorityDTO priority;

    private List<PjTagDTO> tags;

    private ProjectMemberDTO assignee;

}
