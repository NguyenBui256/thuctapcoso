package edu.ptit.ttcs.dto.request;

import edu.ptit.ttcs.entity.dto.response.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class AddIssueDTO {

    @NotBlank(message = "Issue's name cannot be empty")
    private String subject;

    private String description;

    private LocalDate dueDate;

    @NotNull
    private PjStatusDTO status;

    @NotNull
    private PjTypeDTO type;

    @NotNull
    private PjSeverityDTO severity;

    @NotNull
    private PjPriorityDTO priority;

    private List<PjTagDTO> tags;

    private PjMemberDTO assignee;

}
