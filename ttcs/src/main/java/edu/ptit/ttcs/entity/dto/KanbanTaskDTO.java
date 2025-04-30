package edu.ptit.ttcs.entity.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
public class KanbanTaskDTO {
    private Integer id;
    private Integer taskNumber;
    private String title;
    private String description;
    private Integer order;
    private String status;
    private Integer assigneeId;
    private String assigneeName;
    private String assigneeAvatar;
    private Integer swimlandId;
    private String swimlandName;
    private Integer projectId;
    private Date dueDate;
    private Integer priority;
    private Date createdAt;
    private Date updatedAt;
}