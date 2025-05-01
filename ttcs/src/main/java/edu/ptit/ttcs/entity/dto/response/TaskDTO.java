package edu.ptit.ttcs.entity.dto.response;

import edu.ptit.ttcs.entity.ProjectSettingStatus;
import edu.ptit.ttcs.entity.ProjectSettingTag;
import edu.ptit.ttcs.entity.dto.ProjectMemberDTO;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TaskDTO {

    private long id;

    private String name;

    private String description;

    private long userStoryId;

    private PjStatusDTO status;

    private List<PjTagDTO> tags;

    private ProjectMemberDTO assigned;

}
