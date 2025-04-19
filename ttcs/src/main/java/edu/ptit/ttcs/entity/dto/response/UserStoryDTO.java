package edu.ptit.ttcs.entity.dto.response;

import edu.ptit.ttcs.entity.ProjectSettingStatus;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class UserStoryDTO {

    private long id;

    private String name;

    private String description;

    private LocalDateTime dueDate;

    private Integer uxPoints;

    private Integer backPoints;

    private Integer frontPoints;

    private Integer designPoints;

    private ProjectSettingStatus status;

    private List<TaskDTO> tasks;

}
