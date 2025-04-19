package edu.ptit.ttcs.entity.dto.response;

import edu.ptit.ttcs.entity.ProjectSettingStatus;
import edu.ptit.ttcs.entity.ProjectSettingTag;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TaskDTO {

    private long id;

    private String name;

    private String description;

    private ProjectSettingStatus status;

    private List<ProjectSettingTag> tags;

}
