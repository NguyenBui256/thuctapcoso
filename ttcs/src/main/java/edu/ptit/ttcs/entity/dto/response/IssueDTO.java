package edu.ptit.ttcs.entity.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import edu.ptit.ttcs.entity.dto.AttachmentDTO;

@Getter
@Setter
public class IssueDTO {

    private long id;

    private String subject;

    private LocalDate dueDate;

    private String description;

    private int position;

    private PjStatusDTO status;

    private PjTypeDTO type;

    private PjSeverityDTO severity;

    private PjPriorityDTO priority;

    private List<PjTagDTO> tags;

    private List<AttachmentDTO> attachments;

    private PjMemberDTO assignee;

}
